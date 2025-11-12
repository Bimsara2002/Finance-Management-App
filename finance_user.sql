-- ===========================================
--  Oracle Database Schema for Finance System
-- ===========================================

-- ? 1. REGISTER TABLE (User Accounts)
CREATE TABLE register (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(100) UNIQUE NOT NULL,
    email VARCHAR2(150) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO register (username, email, password)
VALUES ('bimsara', 'b@example.com', '123');


-- ? 2. MONTHLY INCOME TABLE
CREATE TABLE monthly_income (
    income_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    month VARCHAR2(50),
    source VARCHAR2(100),
    amount NUMBER(12,2),
    date_received DATE,
    notes VARCHAR2(255)
);

-- ? 3. SAVINGS TABLE
CREATE TABLE savings (
    saving_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    month VARCHAR2(50),
    amount NUMBER(12,2),
    category VARCHAR2(100),
    method VARCHAR2(100),
    date_saved DATE,
    notes VARCHAR2(255)
    
);

-- ? 4. EXPENSES TABLE
CREATE TABLE expenses (
    expense_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    month VARCHAR2(50),
    category VARCHAR2(100),
    amount NUMBER(12,2),
    date_spent DATE,
    payment_method VARCHAR2(100),
    notes VARCHAR2(255)
);

-- ? 5. BUDGET TABLE
CREATE TABLE budget (
    budget_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    month VARCHAR2(50),
    category VARCHAR2(100),
    planned_amount NUMBER(12,2),
    actual_amount NUMBER(12,2),
    notes VARCHAR2(255)
);

-- ? Optional Indexes for performance
CREATE INDEX idx_income_user ON monthly_income(user_id);
CREATE INDEX idx_expense_user ON expenses(user_id);
CREATE INDEX idx_saving_user ON savings(user_id);
CREATE INDEX idx_budget_user ON budget(user_id);

-- ? Optional check constraints
ALTER TABLE monthly_income ADD CONSTRAINT chk_income_amount CHECK (amount >= 0);
ALTER TABLE expenses ADD CONSTRAINT chk_expense_amount CHECK (amount >= 0);
ALTER TABLE savings ADD CONSTRAINT chk_saving_amount CHECK (amount >= 0);
ALTER TABLE budget ADD CONSTRAINT chk_budget_amount CHECK (planned_amount >= 0 AND actual_amount >= 0);

COMMIT;

CREATE TABLE financial_goals (
    goal_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    goal_name VARCHAR2(100),
    target_amount NUMBER(12,2),
    current_amount NUMBER(12,2),
    target_date DATE,
    notes VARCHAR2(255)
);


SELECT * FROM register;

ALTER TABLE savings DROP CONSTRAINT fk_saving_user;

ALTER TABLE expenses DROP CONSTRAINT FK_EXPENSE_USER;

SELECT constraint_name, constraint_type
FROM user_constraints
WHERE table_name = 'EXPENSES';

DROP TABLE savings;

SELECT * FROM financial_goals;

DROP TABLE budget CASCADE CONSTRAINTS;

CREATE TABLE budget (
    budget_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    month_start DATE NOT NULL, -- store first day of the month
    category VARCHAR2(100) NOT NULL,
    planned_amount NUMBER(12,2) NOT NULL,
    actual_amount NUMBER(12,2) NOT NULL,
    notes VARCHAR2(255)
);




CREATE OR REPLACE PROCEDURE get_monthly_report (
    p_user_id IN NUMBER,
    p_month IN VARCHAR2,
    p_total_income OUT NUMBER,
    p_total_expenses OUT NUMBER,
    p_total_savings OUT NUMBER,
    p_balance OUT NUMBER
) AS
BEGIN
    SELECT NVL(SUM(amount), 0)
    INTO p_total_income
    FROM monthly_income
    WHERE user_id = p_user_id
      AND TO_CHAR(date_received, 'YYYY-MM') = p_month;

    SELECT NVL(SUM(amount), 0)
    INTO p_total_expenses
    FROM expenses
    WHERE user_id = p_user_id
      AND TO_CHAR(date_spent, 'YYYY-MM') = p_month;

    SELECT NVL(SUM(amount), 0)
    INTO p_total_savings
    FROM savings
    WHERE user_id = p_user_id
      AND TO_CHAR(date_saved, 'YYYY-MM') = p_month;

    p_balance := p_total_income - (p_total_expenses + p_total_savings);
END;
/


CREATE OR REPLACE PROCEDURE get_yearly_report (
    p_user_id        IN  NUMBER,
    p_year           IN  VARCHAR2,
    p_total_income   OUT NUMBER,
    p_total_expenses OUT NUMBER,
    p_total_savings  OUT NUMBER,
    p_balance        OUT NUMBER
) AS
BEGIN
    -- Income
    SELECT NVL(SUM(amount), 0)
    INTO p_total_income
    FROM monthly_income
    WHERE user_id = p_user_id
      AND TO_CHAR(date_received, 'YYYY') = p_year;

    -- Expenses
    SELECT NVL(SUM(amount), 0)
    INTO p_total_expenses
    FROM expenses
    WHERE user_id = p_user_id
      AND TO_CHAR(date_spent, 'YYYY') = p_year;

    -- Savings
    SELECT NVL(SUM(amount), 0)
    INTO p_total_savings
    FROM savings
    WHERE user_id = p_user_id
      AND TO_CHAR(date_saved, 'YYYY') = p_year;

    -- Balance
    p_balance := p_total_income - (p_total_expenses + p_total_savings);
END;
/


