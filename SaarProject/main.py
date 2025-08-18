import pandas as pd
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from fastapi import FastAPI

class Item(BaseModel):
    data: list

app = FastAPI()

@app.post("/predict")
def predict(item: Item):
    # Load data from client
    df = pd.DataFrame(item.data)

    # Ensure ai_approved_both is numeric (0 or 1)
    df["ai_approved_both"] = df["ai_approved_both"].astype(int)

    # Columns expected to be numeric
    numeric_cols = [
        "user_prod_category_id", "user_prod_condition_id", "user_prod_years_used",
        "user_prod_purchase_price",
        "offered_prod_category_id", "offered_prod_condition_id", "offered_prod_years_used",
        "offered_prod_price",
        "category_match_score", "brand_match", "condition_diff",
        "years_used_diff", "value_diff", "relative_value_diff"
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Encode manufacturer strings as integers
    for col in ["user_prod_manufacturer", "offered_prod_manufacturer"]:
        df[col] = LabelEncoder().fit_transform(df[col].astype(str))

    # Features for the model
    feature_cols = [
        "user_prod_category_id", "user_prod_condition_id", "user_prod_years_used",
        "user_prod_purchase_price", "user_prod_manufacturer",
        "offered_prod_category_id", "offered_prod_condition_id", "offered_prod_years_used",
        "offered_prod_price", "offered_prod_manufacturer", "ai_approved_both",
        "category_match_score", "brand_match", "condition_diff",
        "years_used_diff", "value_diff", "relative_value_diff"
    ]

    # Create synthetic label: 'liked'
    df["liked"] = (
        df["category_match_score"]
        + df["brand_match"]
        - df["condition_diff"]
        - df["years_used_diff"]
        - df["relative_value_diff"]
    ).rank(pct=True) > 0.5
    df["liked"] = df["liked"].astype(int)

    # Train model on current dataset
    X = df[feature_cols]
    y = df["liked"]
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Predict probability that a user likes the offered product
    df["score"] = model.predict_proba(X)[:, 1]

    return df[
        [
            "user_id", "user_product_name", "user_product_id", "user_prod_purchase_price",
            "offered_product_id", "offered_product_name", "offered_prod_price", "score"
        ]
    ].to_dict(orient="records")
