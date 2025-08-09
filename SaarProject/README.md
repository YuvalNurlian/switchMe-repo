# SaarProject - FastAPI Machine Learning Backend

This project contains a FastAPI application that serves a machine learning model (Random Forest) for predicting exchange matches.

## Setup and Running the Application

To get this application up and running, follow these steps:

### 1. Environment Setup

It is highly recommended to use a virtual environment to manage dependencies.

```bash
# Navigate to the SaarProject directory
cd SaarProject

# Create a virtual environment (if you haven't already)
python3 -m venv venv
or
python -m venv venv

# Activate the virtual environment
source venv/bin/activate
or
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

Install the required Python packages using `pip`:

```bash
pip install -r requirements.txt
```

### 3. Database Setup (Crucial!)

The machine learning model relies on specific data structures from your PostgreSQL database. You **must** run the SQL commands provided in `my-backend/new tables.txt` to create the necessary database view and table.

**Important:**
*   The `user_product_offer_features_view` view generates the features required by the model. This view combines data from various tables to prepare the input for the Random Forest.
*   The `user_product_scores` table is used to store the output scores from the model, associating a score with each product for a given user.

Please execute the SQL commands from `my-backend/new tables.txt` in your PostgreSQL database before running the FastAPI application.

### 4. Running the FastAPI Application

Once the environment is set up and database structures are in place, you can start the FastAPI server:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

This will start the server, typically accessible at `http://127.0.0.1:8000`.

### Machine Learning Model Details

The FastAPI application exposes a `/predict` endpoint that uses a pre-trained Random Forest model. This model takes the following features as input, which are derived from the `user_product_offer_features_view`:

*   `user_prod_category_id`
*   `user_prod_condition_id`
*   `user_prod_years_used`
*   `user_prod_purchase_price`
*   `user_prod_manufacturer`
*   `offered_prod_category_id`
*   `offered_prod_condition_id`
*   `offered_prod_years_used`
*   `offered_prod_price`
*   `offered_prod_manufacturer`
*   `ai_approved_both`
*   `category_match_score`
*   `brand_match`
*   `condition_diff`
*   `years_used_diff`
*   `value_diff`
*   `relative_value_diff`

The model's output (the `score`) is then saved into the `user_product_scores` table.
