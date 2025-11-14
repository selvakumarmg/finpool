# FinPool Supabase API & Schema Reference

Authoritative catalogue of the planned Supabase REST/RPC endpoints and relational schema that back the FinPool mobile app. Every section highlights the page(s) that call into the API, the expected request / response contract, and the Supabase tables involved. Unless stated otherwise, all endpoints require the Supabase `anon` key in combination with a valid authenticated session. After every successful create or update call the client **must clear the local form state** before returning to the previous screen—apply this across all pages to keep the UX consistent.

---

## Page-wise API Catalogue

### Auth • `/auth/login`
- `POST /auth/v1/token?grant_type=password` – Sign in with email/password. Response includes access/refresh tokens.  
  - Tables touched: `auth.users`, `public.profiles`.  
  - UI reset: clear email/password fields, reset loading/error flags.
- `GET /auth/v1/user` – Retrieve the current Supabase auth user.  
  - Tables touched: `auth.users`.  
  - Used when the root layout rehydrates Redux state.
- `POST /auth/v1/logout` – Invalidate refresh token on logout.  
  - UI reset: wipe Redux `auth` slice and clear any cached inputs.

### Dashboard • `/(tabs)/index`
- `GET /rest/v1/transactions?user_id=eq.$uid&order=timestamp.desc&limit=10` – Fetch latest transactions for the summary cards.  
  - Tables: `transactions`.
- `GET /rest/v1/loans?user_id=eq.$uid&select=*,loan_emis(count)` – Populate loan overview widgets.  
  - Tables: `loans`, `loan_emis`.
- `GET /rest/v1/notifications?user_id=eq.$uid&read=is.false&limit=1` – Unread notification badge.  
  - Tables: `notifications`.
- UI reset rule: none (read-only screen) but clear any search/filter local state when leaving the view.

### Loans List • `/(tabs)/loans`
- `GET /rest/v1/loans?user_id=eq.$uid&select=*,loan_emis(*)&order=created_at.desc` – Full loan catalogue.  
  - Tables: `loans`, `loan_emis`.
- `PATCH /rest/v1/loans?id=eq.$loanId` – Update loan status (e.g., mark completed).  
  - Tables: `loans`.
- UI reset: on filter or search submission, clear the text inputs once results load.

### Add Loan • `/(tabs)/addLoan`
- `POST /rest/v1/loans` – Create a loan record (principal, rate, tenure...).  
  - Tables: `loans`.
- `POST /rest/v1/loan_emis` – Bulk insert generated EMI schedule.  
  - Tables: `loan_emis`.
- `POST /rest/v1/notifications` – Fire a “Loan added” notification.  
  - Tables: `notifications`.
- UI reset: after success, reset all form fields (`lenderName`, `loanType`, `principalAmount`, `interestRate`, `tenureMonths`, `startDate`, `description`) and generated EMI preview state.

### EMI Payment • (invoked from loans detail cards)
- `PATCH /rest/v1/loan_emis?id=eq.$emiId` – Mark EMI as paid, set `paid_date`.  
  - Tables: `loan_emis`.
- `PATCH /rest/v1/loans?id=eq.$loanId` – Update `paid_amount`, `remaining_amount`, `status`.  
  - Tables: `loans`.
- `POST /rest/v1/notifications` – “EMI paid” confirmation.  
  - Tables: `notifications`.
- UI reset: collapse any in-place payment forms and clear toggles.

### Activities List • `/(tabs)/activities`
- `GET /rest/v1/activities?user_id=eq.$uid&order=timestamp.desc` – Retrieve grouped activity logs.  
  - Tables: `activities`.
- `GET /rest/v1/activity_items?activity_id=eq.$id` – Populate sub-item lists.  
  - Tables: `activity_items`.
- UI reset: clear swipe/selection state when navigation exits the page.

### All Activities • `/(tabs)/allActivities` & Activity Detail • `/(tabs)/activityDetail`
- `GET /rest/v1/activities?id=eq.$id&select=*,activity_items(*)` – Detailed view.  
  - Tables: `activities`, `activity_items`.
- UI reset: when closing detail modal, reset local filters/search fields.

### Add Activity • `/(tabs)/addActivity`
- `POST /rest/v1/activities` – Create parent activity.  
  - Tables: `activities`.
- `POST /rest/v1/activity_items` – Bulk insert subitems (name, price, qty, unit).  
  - Tables: `activity_items`.
- UI reset: clear parent fields (`name`, `category`, `date`, `payment_method`) and wipe the dynamic subitem array after success.

### Edit Activity • `/(tabs)/editActivity`
- `PATCH /rest/v1/activities?id=eq.$id` – Update activity metadata.  
  - Tables: `activities`.
- `PATCH /rest/v1/activity_items?id=in.($ids)` – Update existing subitems.  
  - `DELETE /rest/v1/activity_items?id=in.($removedIds)` – Remove orphaned subitems.  
  - Tables: `activity_items`.
- UI reset: reset dirty flags and edited field values once the PATCH resolves.

### Expense Breakdown • `/(tabs)/expenseBreakdown`
- `GET /rest/v1/transactions?user_id=eq.$uid&select=category,amount,date` – Feed analytics charts.  
  - Tables: `transactions`.
- `GET /rest/v1/transactions_summary_daily?user_id=eq.$uid&range=$start.$end` – Call a Postgres view to fetch aggregated daily totals.  
  - Sources: `vw_transaction_daily_summary` (see schema section).
- UI reset: clear filter modals and date pickers after applying.

### Add Transaction • `/(tabs)/addTransaction`
- `POST /rest/v1/transactions` – Persist transaction (income/expense).  
  - Tables: `transactions`.
- `POST /rest/v1/notifications` – Notify of new transaction.  
  - Tables: `notifications`.
- Optional: `GET /rest/v1/transaction_categories?type=eq.$activeTab` – Populate category chips.  
  - Tables: `transaction_categories`.
- UI reset: reset `amount`, `category`, `description`, toggle back to default tab.

### Transactions Maintenance (delete/undo)
- `DELETE /rest/v1/transactions?id=eq.$id` – Remove transaction.  
  - Cascade updates handled via triggers updating summaries.
- UI reset: clear confirmation modal state and selection chips.

### Notifications • `/(tabs)/notifications`
- `GET /rest/v1/notifications?user_id=eq.$uid&order=timestamp.desc` – Notification feed.  
  - Tables: `notifications`.
- `PATCH /rest/v1/notifications?id=eq.$id` – Mark single notification as read.  
  - `PATCH /rest/v1/notifications?user_id=eq.$uid` with payload `{ read: true }` – Mark all as read.  
  - Tables: `notifications`.
- UI reset: on “mark all” success, reset pull-to-refresh and selection state.

### Profile • `/(tabs)/profile`
- `GET /rest/v1/profiles?id=eq.$uid` – Populate user profile card.  
  - Tables: `profiles`.
- `PATCH /rest/v1/profiles?id=eq.$uid` – Update profile details/settings.  
  - Tables: `profiles`.
- `GET /rest/v1/app_settings?user_id=eq.$uid` / `PATCH` – Manage per-user preferences (currency, theme).  
  - Tables: `app_settings`.
- UI reset: clear edit form values and modals after save.

### Quick Add Hub • `/(tabs)/add`
- `GET /rest/v1/quick_actions?user_id=eq.$uid` – Optional service to fetch personalized quick actions.  
  - Tables: `quick_actions`.
- UI reset: ensure selected quick action resets after navigation.

### Reminders (future tab)
- `GET /rest/v1/bill_reminders?user_id=eq.$uid&order=due_date.asc` – Render upcoming bills.  
  - Tables: `bill_reminders`.
- `POST /rest/v1/bill_reminders` / `PATCH` / `DELETE` – CRUD bill reminders.  
  - Tables: `bill_reminders`.
- `POST /rest/v1/rpc/schedule_notification` – RPC to enqueue Expo push notifications.  
  - Uses: `bill_reminders`, `notification_schedules`.
- UI reset: clear reminder form fields, including date pickers and toggles.

---

## Supabase Database Schema

Each table lives in the `public` schema unless noted. Timestamp columns default to `timezone('utc', now())`. All `user_id` foreign keys reference `auth.users.id`.

### `profiles`
| Column          | Type           | Nullable | Default                    | Description                    |
|-----------------|----------------|----------|----------------------------|--------------------------------|
| `id`            | `uuid`         | false    | `uuid_generate_v4()`       | Primary key, mirrors auth user |
| `full_name`     | `text`         | true     |                            | Display name                   |
| `email`         | `text`         | false    |                            | Lower-cased unique email       |
| `avatar_url`    | `text`         | true     |                            | Avatar image                   |
| `currency`      | `text`         | false    | `'INR'`                    | Preferred currency             |
| `timezone`      | `text`         | false    | `'Asia/Kolkata'`           | User timezone                  |
| `created_at`    | `timestamptz`  | false    | `now()`                    | Row creation                   |
| `updated_at`    | `timestamptz`  | false    | `now()`                    | Updated via trigger            |

### `transactions`
| Column           | Type          | Nullable | Default               | Description                                 |
|------------------|---------------|----------|-----------------------|---------------------------------------------|
| `id`             | `uuid`        | false    | `uuid_generate_v4()`  | Primary key                                 |
| `user_id`        | `uuid`        | false    |                       | FK → `profiles.id`                          |
| `type`           | `text`        | false    |                       | `'income'` or `'expense'`                   |
| `amount`         | `numeric(12,2)` | false  |                       | Transaction amount                          |
| `category`       | `text`        | false    |                       | Category label                              |
| `description`    | `text`        | true     |                       | Optional note                               |
| `date`           | `date`        | false    | `current_date`        | Local-date of transaction                   |
| `timestamp`      | `timestamptz` | false    | `now()`               | Exact creation timestamp                     |
| `is_recurring`   | `boolean`     | false    | `false`               | Tag for recurring entries                    |
| `recurring_id`   | `uuid`        | true     |                       | FK → `recurring_expenses.id`                 |
| `created_at`     | `timestamptz` | false    | `now()`               | Audit                                        |
| `updated_at`     | `timestamptz` | false    | `now()`               | Audit                                        |

Indexes: `(user_id, timestamp desc)` for dashboard queries; `(user_id, category)` for breakdowns.

### `transaction_categories`
Reference catalog used by the add transaction screen.
| Column        | Type      | Nullable | Default              |
|---------------|-----------|----------|----------------------|
| `id`          | `uuid`    | false    | `uuid_generate_v4()` |
| `type`        | `text`    | false    |                      |
| `label`       | `text`    | false    |                      |
| `is_default`  | `boolean` | false    | `true`               |

### `activities`
| Column          | Type            | Nullable | Default              | Description                    |
|-----------------|-----------------|----------|----------------------|--------------------------------|
| `id`            | `uuid`          | false    | `uuid_generate_v4()` | Primary key                    |
| `user_id`       | `uuid`          | false    |                      | FK → `profiles.id`             |
| `name`          | `text`          | false    |                      | Activity title                 |
| `category`      | `text`          | false    |                      | Activity category              |
| `total_amount`  | `numeric(12,2)` | false    | `0`                  | Cached total                   |
| `date`          | `date`          | false    | `current_date`       | Activity date                  |
| `payment_method`| `text`          | false    | `'cash'`             | `cash/account/card/upi`        |
| `timestamp`     | `timestamptz`   | false    | `now()`              | Creation timestamp             |
| `created_at`    | `timestamptz`   | false    | `now()`              | Audit                          |
| `updated_at`    | `timestamptz`   | false    | `now()`              | Audit                          |

### `activity_items`
| Column        | Type            | Nullable | Default              | Description                          |
|---------------|-----------------|----------|----------------------|--------------------------------------|
| `id`          | `uuid`          | false    | `uuid_generate_v4()` | Primary key                          |
| `activity_id` | `uuid`          | false    |                      | FK → `activities.id`                 |
| `name`        | `text`          | false    |                      | Item name                            |
| `price`       | `numeric(12,2)` | false    |                      | Unit price                           |
| `quantity`    | `numeric(10,2)` | true     | `1`                  | Quantity                             |
| `unit`        | `text`          | true     |                      | Measurement unit                     |
| `timestamp`   | `timestamptz`   | false    | `now()`              | Added at                             |

Trigger recalculates parent `activities.total_amount` on insert/update/delete.

### `loans`
| Column               | Type            | Nullable | Default              | Description                               |
|----------------------|-----------------|----------|----------------------|-------------------------------------------|
| `id`                 | `uuid`          | false    | `uuid_generate_v4()` | Primary key                               |
| `user_id`            | `uuid`          | false    |                      | FK → `profiles.id`                        |
| `lender_name`        | `text`          | false    |                      |                                           |
| `loan_type`          | `text`          | false    |                      |                                           |
| `principal_amount`   | `numeric(14,2)` | false    |                      |                                           |
| `interest_rate`      | `numeric(5,2)`  | false    |                      | Annual percentage                         |
| `tenure_months`      | `integer`       | false    |                      | Duration                                  |
| `emi_amount`         | `numeric(12,2)` | false    |                      | Monthly EMI value                         |
| `start_date`         | `date`          | false    |                      |                                           |
| `remaining_amount`   | `numeric(14,2)` | false    |                      | Updated via triggers                      |
| `paid_amount`        | `numeric(14,2)` | false    | `0`                  | Total paid                                |
| `status`             | `text`          | false    | `'active'`           | `active/completed/overdue`                |
| `description`        | `text`          | true     |                      | Notes                                     |
| `created_at`         | `timestamptz`   | false    | `now()`              |                                           |
| `updated_at`         | `timestamptz`   | false    | `now()`              |                                           |

### `loan_emis`
| Column       | Type            | Nullable | Default              | Description                               |
|--------------|-----------------|----------|----------------------|-------------------------------------------|
| `id`         | `uuid`          | false    | `uuid_generate_v4()` | Primary key                               |
| `loan_id`    | `uuid`          | false    |                      | FK → `loans.id`                           |
| `month_index`| `integer`       | false    |                      | 1-based month counter                     |
| `amount`     | `numeric(12,2)` | false    |                      | EMI amount                                |
| `due_date`   | `date`          | false    |                      | Scheduled due date                        |
| `is_paid`    | `boolean`       | false    | `false`              | Payment flag                              |
| `paid_date`  | `date`          | true     |                      | Populated when `is_paid` = true           |
| `created_at` | `timestamptz`   | false    | `now()`              |                                           |
| `updated_at` | `timestamptz`   | false    | `now()`              |                                           |

### `notifications`
| Column       | Type            | Nullable | Default              | Description               |
|--------------|-----------------|----------|----------------------|---------------------------|
| `id`         | `uuid`          | false    | `uuid_generate_v4()` | Primary key               |
| `user_id`    | `uuid`          | false    |                      | FK → `profiles.id`        |
| `title`      | `text`          | false    |                      |                           |
| `message`    | `text`          | false    |                      |                           |
| `type`       | `text`          | false    |                      | `info/success/warning/error` |
| `read`       | `boolean`       | false    | `false`              |                           |
| `timestamp`  | `timestamptz`   | false    | `now()`              | Display ordering          |
| `created_at` | `timestamptz`   | false    | `now()`              | Audit                     |

### `recurring_expenses` (future enhancement)
| Column              | Type            | Nullable | Default              | Description                        |
|---------------------|-----------------|----------|----------------------|------------------------------------|
| `id`                | `uuid`          | false    | `uuid_generate_v4()` | Primary key                        |
| `user_id`           | `uuid`          | false    |                      | FK → `profiles.id`                 |
| `title`             | `text`          | false    |                      | Friendly name                      |
| `amount`            | `numeric(12,2)` | false    |                      | Recurring amount                   |
| `category`          | `text`          | false    |                      | Associated category                |
| `frequency`         | `text`          | false    |                      | `daily/weekly/biweekly/monthly/...` |
| `start_date`        | `date`          | false    |                      |                                    |
| `next_due_date`     | `date`          | false    |                      |                                    |
| `reminder_before`   | `integer`       | false    | `3`                  | Days before due                    |
| `auto_add`          | `boolean`       | false    | `true`               | Auto convert into transaction      |
| `active`            | `boolean`       | false    | `true`               | Toggle                             |
| `created_at`        | `timestamptz`   | false    | `now()`              |                                    |
| `updated_at`        | `timestamptz`   | false    | `now()`              |                                    |

### `bill_reminders`
| Column           | Type            | Nullable | Default              | Description                     |
|------------------|-----------------|----------|----------------------|---------------------------------|
| `id`             | `uuid`          | false    | `uuid_generate_v4()` | Primary key                     |
| `user_id`        | `uuid`          | false    |                      | FK → `profiles.id`              |
| `title`          | `text`          | false    |                      | Reminder title                  |
| `amount`         | `numeric(12,2)` | true     |                      | Optional payment amount         |
| `due_date`       | `date`          | false    |                      |                                 |
| `status`         | `text`          | false    | `'pending'`          | `pending/snoozed/paid/overdue`  |
| `notification_at`| `timestamptz`   | true     |                      | Next notification timestamp     |
| `snooze_count`   | `smallint`      | false    | `0`                  | Snooze attempts                 |
| `created_at`     | `timestamptz`   | false    | `now()`              |                                 |
| `updated_at`     | `timestamptz`   | false    | `now()`              |                                 |

### `app_settings`
Per-user configuration surfaced in the profile screen.
| Column        | Type        | Nullable | Default              |
|---------------|-------------|----------|----------------------|
| `id`          | `uuid`      | false    | `uuid_generate_v4()` |
| `user_id`     | `uuid`      | false    |                      |
| `theme`       | `text`      | false    | `'dark'`             |
| `language`    | `text`      | false    | `'en'`               |
| `notifications_enabled` | `boolean` | false | `true` |
| `created_at`  | `timestamptz` | false | `now()` |
| `updated_at`  | `timestamptz` | false | `now()` |

### `quick_actions`
Optional personalization data for the quick-add hub.
| Column        | Type      | Nullable | Default              |
|---------------|-----------|----------|----------------------|
| `id`          | `uuid`    | false    | `uuid_generate_v4()` |
| `user_id`     | `uuid`    | false    |                      |
| `label`       | `text`    | false    |                      |
| `target_route`| `text`    | false    |                      |
| `icon`        | `text`    | true     |                      |
| `created_at`  | `timestamptz` | false | `now()`              |

### Views & RPC helpers
- `vw_transaction_daily_summary` – Materialized view summarizing daily totals (`date`, `income_total`, `expense_total`, `net`, `user_id`). Refreshed via trigger on `transactions`.
- `vw_monthly_category_ratio` – View returning category percentages per month for analytics (`month`, `category`, `amount`, `ratio`).
- `schedule_notification(reminder_id uuid)` – RPC to create Expo notification jobs, writing into `notification_schedules`.

---

## Client-side Form Reset Checklist

Apply these guardrails after every successful mutation:
- Reuse a `resetForm()` helper inside the Redux thunks to clear local component state (`setAmount('')`, `setCategory('')`, etc.).
- Ensure stored values (via Redux or React state) are reset before navigating away to avoid stale defaults.
- For multi-step forms (Loan, Activity), clear both the main entity and its nested collection arrays.
- Run the reset before triggering navigation so the back stack shows a pristine form when revisited.
- Mirror this behaviour across Add Transaction, Add Loan, Add Activity, Edit Activity, Reminder creation, and Profile edit forms.

This guarantees parity between local store state and persisted Supabase data throughout the app.

