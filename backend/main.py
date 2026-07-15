# ══════════════════════════════════════════════════════════════════
# main.py — FastAPI backend for Mshauri wa Malipo ya Kigeni
# ══════════════════════════════════════════════════════════════════

import os
import joblib
import numpy as np
import pandas as pd
from datetime import timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATA_DIR   = os.path.join(BASE_DIR, 'data')

app = FastAPI(title="Mshauri wa Malipo ya Kigeni API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENCIES = {"usd": "USD", "eur": "EUR", "cny": "CNY"}

PURPOSE_MESSAGES = {
    "streaming": {"LIPA SASA": "Lipia subscription sasa — bei itapanda na utapoteza zaidi ukisubiri. 🎬",
                  "SUBIRI": "Ukisubiri, subscription itakugharimu TZS chache zaidi. 🎬",
                  "ANGALIA": "Bei iko stable — unaweza kulipa wakati wowote. 🎬"},
    "bidhaa":    {"LIPA SASA": "Lipia invoice sasa kabla bei haijapanda. 📦",
                  "SUBIRI": "Subiri — bei itashuka na utaokoa. 📦",
                  "ANGALIA": "Bei iko stable. Unaweza kulipa wakati wowote. 📦"},
    "safari":    {"LIPA SASA": "Nunua fedha kwa safari sasa — bei itapanda. ✈️",
                  "SUBIRI": "Subiri — bei itashuka na utapata thamani nzuri. ✈️",
                  "ANGALIA": "Bei iko stable. ✈️"},
    "kutuma":    {"LIPA SASA": "Tuma pesa sasa! Bei itapanda. 📤",
                  "SUBIRI": "Subiri — bei itashuka. 📤",
                  "ANGALIA": "Bei iko stable. Unaweza kutuma pesa wakati wowote. 📤"},
    "masomo":    {"LIPA SASA": "Lipia ada sasa — bei itapanda. 🎓",
                  "SUBIRI": "Kama tarehe inaruhusu, subiri — bei itashuka. 🎓",
                  "ANGALIA": "Bei iko stable — panga malipo kulingana na tarehe yako. 🎓"},
    "afya":      {"LIPA SASA": "Lipia sasa — bei itapanda. 💊",
                  "SUBIRI": "Kama hali inaruhusu, subiri — bei itashuka. 💊",
                  "ANGALIA": "Bei iko stable. 💊"},
    "nyingine":  {"LIPA SASA": "Fanya malipo sasa — bei itapanda.",
                  "SUBIRI": "Subiri — bei itashuka.",
                  "ANGALIA": "Bei iko stable."},
}

_data_cache = {}
_models_cache = {}
_load_errors = {}

def load_data():
    for cur, name in CURRENCIES.items():
        path = os.path.join(DATA_DIR, f'{cur}_tzs_clean.csv')
        df = pd.read_csv(path)
        df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y', errors='coerce')
        df = df.sort_values('date').reset_index(drop=True)
        _data_cache[name] = df

def load_models():
    for cur in CURRENCIES.keys():
        _models_cache[cur] = {'arima': None, 'prophet': None, 'xgboost': None, 'lstm': None, 'scaler': None}
        _load_errors[cur] = {}
        try:
            _models_cache[cur]['arima'] = joblib.load(os.path.join(MODELS_DIR, f'arima_{cur}_model.pkl'))
        except Exception as e:
            _load_errors[cur]['arima'] = str(e)
        try:
            _models_cache[cur]['prophet'] = joblib.load(os.path.join(MODELS_DIR, f'prophet_{cur}_model.pkl'))
        except Exception as e:
            _load_errors[cur]['prophet'] = str(e)
        try:
            _models_cache[cur]['xgboost'] = joblib.load(os.path.join(MODELS_DIR, f'xgboost_{cur}_model_direct.pkl'))
        except Exception as e:
            _load_errors[cur]['xgboost'] = str(e)
        try:
            import tensorflow as tf
            _models_cache[cur]['lstm'] = tf.keras.models.load_model(
                os.path.join(MODELS_DIR, f'lstm_{cur}_model.h5'), compile=False)
            _models_cache[cur]['scaler'] = joblib.load(os.path.join(MODELS_DIR, f'scaler_{cur}.pkl'))
        except Exception as e:
            _load_errors[cur]['lstm'] = str(e)
        for name, err in _load_errors[cur].items():
            print(f"[MODEL LOAD FAILED] currency={cur} model={name} error={err}")

@app.on_event("startup")
def startup():
    load_data()
    load_models()


def pred_arima(model, steps):
    try:
        return model.forecast(steps=steps).values
    except Exception:
        return None

def pred_prophet(model, steps):
    try:
        future = model.make_future_dataframe(periods=steps)
        forecast = model.predict(future)
        return forecast['yhat'].tail(steps).values
    except Exception:
        return None

def _xgboost_features(df):
    vals = df['mean'].values
    i = len(vals) - 1
    l1  = vals[i]
    l3  = vals[i-2]  if i >= 2  else l1
    l7  = vals[i-6]  if i >= 6  else l1
    l14 = vals[i-13] if i >= 13 else l1
    l30 = vals[i-29] if i >= 29 else l1
    ma7  = vals[max(0, i-6):i+1].mean()
    ma30 = vals[max(0, i-29):i+1].mean()
    std7 = vals[max(0, i-6):i+1].std()
    d = df['date'].iloc[i]
    return np.array([[l1, l3, l7, l14, l30, ma7, ma30, std7,
                      d.month, d.weekday(), (d.month - 1) // 3 + 1]])

def pred_xgboost(model, df, steps):
    try:
        feat = _xgboost_features(df)
        pred = model.predict(feat)[0]
        return np.array(pred[:steps])
    except Exception:
        return None

def pred_lstm(model, scaler, df, steps, seq=60):
    try:
        if len(df) < seq:
            return None
        scaled = scaler.transform(df['mean'].values[-seq:].reshape(-1, 1)).flatten()
        X = scaled.reshape(1, seq, 1)
        pred_scaled = model.predict(X, verbose=0)[0]
        pred = scaler.inverse_transform(pred_scaled.reshape(-1, 1)).flatten()
        return pred[:steps]
    except Exception:
        return None

def get_ensemble(models_dict, df, cur_key, steps):
    forecasts = {}
    p = pred_xgboost(models_dict[cur_key]['xgboost'], df, steps)
    if p is not None: forecasts['XGBoost'] = p
    if models_dict[cur_key]['lstm'] and models_dict[cur_key]['scaler']:
        p = pred_lstm(models_dict[cur_key]['lstm'], models_dict[cur_key]['scaler'], df, steps)
        if p is not None: forecasts['LSTM'] = p
    p = pred_arima(models_dict[cur_key]['arima'], steps)
    if p is not None: forecasts['ARIMA'] = p
    p = pred_prophet(models_dict[cur_key]['prophet'], steps)
    if p is not None: forecasts['Prophet'] = p
    if not forecasts:
        return None, {}
    ensemble = np.mean(list(forecasts.values()), axis=0)
    return ensemble, forecasts

def get_confidence_band(all_forecasts, ensemble):
    if len(all_forecasts) < 2:
        spread = ensemble * 0.005
        return ensemble - spread, ensemble + spread
    arr = np.array(list(all_forecasts.values()))
    std = np.std(arr, axis=0)
    return ensemble - std, ensemble + std

def get_confidence_label(all_forecasts):
    if len(all_forecasts) < 2:
        return "Kati", "Data haitoshi kulinganisha"
    arr = np.array(list(all_forecasts.values()))
    spread_pct = float(np.std(arr[:, -1]) / np.mean(arr[:, -1]) * 100)
    if spread_pct < 0.5:
        return "Juu", "Uchambuzi mbalimbali unakubaliana"
    elif spread_pct < 2.0:
        return "Kati", "Uchambuzi unakubaliana kiasi"
    else:
        return "Chini", "Uchambuzi haukubaliani — angalia kwa makini"

def best_day_analysis(df):
    temp = df.copy()
    temp['weekday'] = temp['date'].dt.day_name()
    temp['week_of_month'] = (temp['date'].dt.day - 1) // 7 + 1
    wd = temp.groupby('weekday')['mean'].mean()
    wom = temp.groupby('week_of_month')['mean'].mean()
    best_wd = wd.idxmin()
    best_wom = int(wom.idxmin())
    day_sw = {'Monday':'Jumatatu','Tuesday':'Jumanne','Wednesday':'Jumatano',
              'Thursday':'Alhamisi','Friday':'Ijumaa','Saturday':'Jumamosi','Sunday':'Jumapili'}
    wom_lbl = {1:"Wiki ya 1",2:"Wiki ya 2",3:"Wiki ya 3",4:"Wiki ya 4"}
    return {
        'best_weekday': day_sw.get(best_wd, best_wd),
        'best_wom': wom_lbl.get(best_wom, f"Wiki {best_wom}"),
        'avg_saving_wd': float(wd.max() - wd.min()),
    }

def get_advice(current_rate, ensemble, payment_amount, cur_name, purpose_key, steps):
    avg_future = float(np.mean(ensemble))
    change_pct = (avg_future - current_rate) / current_rate * 100
    tzs_now = payment_amount * current_rate
    tzs_later = payment_amount * avg_future
    tzs_save = tzs_now - tzs_later

    if change_pct > 1.0:
        action, icon = "LIPA SASA", "⚡"
        headline = f"Bei ya {cur_name} inatarajiwa KUPANDA kwa {change_pct:.1f}% katika siku {steps} zijazo."
        saving_direction, saving_amount = "hasara", abs(tzs_save)
    elif change_pct < -1.0:
        action, icon = "SUBIRI", "⏳"
        headline = f"Bei ya {cur_name} inatarajiwa KUSHUKA kwa {abs(change_pct):.1f}% katika siku {steps} zijazo."
        saving_direction, saving_amount = "okoa", abs(tzs_save)
    else:
        action, icon = "ANGALIA", "👀"
        headline = f"Bei ya {cur_name} iko STABLE sasa hivi (mabadiliko ya {change_pct:.1f}% tu)."
        saving_direction, saving_amount = "stable", 0.0

    if abs(change_pct) >= 2.0:
        urg_level, urg_note = "Juu", "Mabadiliko ya bei ni makubwa — chukua hatua haraka."
    elif abs(change_pct) >= 1.0:
        urg_level, urg_note = "Kati", "Mabadiliko ni wastani — angalia kabla ya kulipa."
    else:
        urg_level, urg_note = "Ndogo", "Mabadiliko ni madogo — hatari ni ndogo kwa sasa."

    purpose_text = PURPOSE_MESSAGES.get(purpose_key, PURPOSE_MESSAGES["nyingine"])[action]

    return {
        "action": action, "icon": icon, "headline": headline, "purpose_text": purpose_text,
        "change_pct": round(change_pct, 2),
        "tzs_now": round(tzs_now, 2), "tzs_later": round(tzs_later, 2),
        "saving_direction": saving_direction, "saving_amount": round(saving_amount, 2),
        "avg_future": round(avg_future, 4),
        "urgency_level": urg_level, "urgency_note": urg_note,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/forecast")
def forecast(
    currency: str = Query(..., pattern="^(usd|eur|cny)$"),
    steps: int = Query(7, ge=1, le=30),
    purpose: str = Query("nyingine"),
    amount: float = Query(1000.0, gt=0),
):
    cur_key = currency.lower()
    cur_display = CURRENCIES[cur_key]

    if cur_display not in _data_cache:
        raise HTTPException(status_code=500, detail="Data not loaded")

    df = _data_cache[cur_display]
    current_rate = float(df['mean'].iloc[-1])
    prev_rate = float(df['mean'].iloc[-2])
    rate_delta = current_rate - prev_rate
    rate_delta_p = rate_delta / prev_rate * 100
    last_date = df['date'].iloc[-1]
    days_old = (pd.Timestamp.now() - last_date).days

    ensemble, all_forecasts = get_ensemble(_models_cache, df, cur_key, steps)
    if ensemble is None:
        raise HTTPException(status_code=500, detail="No models could produce a forecast")

    lower_band, upper_band = get_confidence_band(all_forecasts, ensemble)
    advice = get_advice(current_rate, ensemble, amount, cur_display, purpose, steps)
    bda = best_day_analysis(df)
    conf_label, conf_note = get_confidence_label(all_forecasts)

    future_dates = [(df['date'].iloc[-1] + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(steps)]
    hist = df.tail(120)

    return {
        "currency": cur_display,
        "current_rate": round(current_rate, 4),
        "buying": round(float(df['buying'].iloc[-1]), 2),
        "selling": round(float(df['selling'].iloc[-1]), 2),
        "rate_delta": round(rate_delta, 4),
        "rate_delta_pct": round(rate_delta_p, 4),
        "last_date": last_date.strftime('%Y-%m-%d'),
        "days_old": int(days_old),
        "advice": advice,
        "confidence": {"label": conf_label, "note": conf_note},
        "best_day": bda,
        "forecast": {
            "dates": future_dates,
            "ensemble": [round(float(v), 4) for v in ensemble],
            "lower_band": [round(float(v), 4) for v in lower_band],
            "upper_band": [round(float(v), 4) for v in upper_band],
        },
        "history": {
            "dates": hist['date'].dt.strftime('%Y-%m-%d').tolist(),
            "values": [round(float(v), 4) for v in hist['mean']],
        },
        "debug": {
            "models_used": list(all_forecasts.keys()),
            "load_errors": _load_errors.get(cur_key, {}),
            "per_model_final_day": {
                name: round(float(vals[-1]), 4) for name, vals in all_forecasts.items()
            },
        },
    }

@app.get("/api/compare")
def compare():
    result = []
    for cur_key, cur_display in CURRENCIES.items():
        df = _data_cache[cur_display]
        cv = float(df['mean'].iloc[-1])
        pv = float(df['mean'].iloc[-2])
        chg = cv - pv
        chgp = chg / pv * 100
        result.append({
            "currency": cur_display,
            "rate": round(cv, 2),
            "change": round(chg, 2),
            "change_pct": round(chgp, 2),
        })
    return {"currencies": result}

@app.get("/api/recent")
def recent(currency: str = Query(..., pattern="^(usd|eur|cny)$"), days: int = 30):
    cur_display = CURRENCIES[currency.lower()]
    df = _data_cache[cur_display].tail(days)
    return {
        "dates": df['date'].dt.strftime('%Y-%m-%d').tolist(),
        "values": [round(float(v), 4) for v in df['mean']],
    }