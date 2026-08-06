# Справочник Формул и Расчетов (МСФО)

**ВАЖНО:** Используйте формулы, описанные в этом справочнике, для программирования логики расчетного движка (Backend/Frontend), если пользователь не указал иное.

---

## Основные Связи (Core Linkages)

```typescript
Баланс (Balance Sheet):       Assets = Liabilities + Equity
Чистая прибыль (Net Income):  IS Net Income → CF Operations (стартовая точка)
Движение денег (Cash Flow):   ΔCash = CFO + CFI + CFF
Сверка Кэша (Cash Tie-Out):   Ending Cash (CF) = Cash (BS Asset)
Помесячно/Ежегодно:           Closing Cash (Monthly) = Closing Cash (Annual)
Нераспределенная прибыль:     Prior RE + Net Income - Dividends = Ending RE
Долевое финансирование:       ΔCommon Stock/APIC (BS) = Equity Issuance (CFF)
Капитал 0-го года:            Equity Raised (Year 0) = Beginning Equity (Year 1)
```

## Расчет Валовой Прибыли (Gross Profit)

**ВАЖНО:** Валовая прибыль должна рассчитываться от Чистой Выручки (Net Revenue), а не Валовой Выручки (Gross Revenue).

```typescript
Net Revenue - Cost of Revenue = Gross Profit
```

| Термин | Определение |
|------|------------|
| Валовая выручка (Gross Revenue) | Общая выручка до любых вычетов |
| Чистая выручка (Net Revenue) | Gross Revenue - Возвраты - Скидки - Уступки |
| Себестоимость (Cost of Revenue / COGS) | Прямые затраты на производство товаров/услуг |
| Валовая прибыль (Gross Profit) | Net Revenue - Cost of Revenue |

## Формулы Маржинальности (Margin Formulas)

```typescript
Gross Margin %      = Gross Profit / Net Revenue
EBITDA              = EBIT + D&A  (или = Gross Profit - OpEx)
EBITDA Margin %     = EBITDA / Net Revenue
EBIT Margin %       = EBIT / Net Revenue
Net Income Margin % = Net Income / Net Revenue
```

## Формулы Кредитных Метрик (Credit Metric Formulas)

```typescript
Общий долг (Total Debt)     = Current Portion of Debt + Long-Term Debt
Чистый долг (Net Debt)      = Total Debt - Cash
Total Debt / EBITDA         = Total Debt / EBITDA (из ОПиУ)
Net Debt / EBITDA           = Net Debt / EBITDA (из ОПиУ)
Покрытие процентов          = EBITDA / Interest Expense (из ОПиУ)
Net Int Exp % Debt          = Net Interest Expense / Long-Term Debt
Debt / Total Cap            = Total Debt / (Total Debt + Total Equity)
Debt / Equity               = Total Debt / Total Equity
Текущая ликвидность         = Total Current Assets / Total Current Liabilities
Быстрая ликвидность         = (Total Current Assets - Inventory) / Total Current Liabilities
```

## Формулы Прогнозирования (% от Выручки)

```typescript
Себестоимость (Прогноз) = Net Revenue × Допущение Cost of Revenue %
S&M (Прогноз)           = Net Revenue × Допущение S&M %
G&A (Прогноз)           = Net Revenue × Допущение G&A %
R&D (Прогноз)           = Net Revenue × Допущение R&D %
SBC (Прогноз)           = Net Revenue × Допущение SBC %
```

## Формулы Рабочего Капитала (Working Capital)

```typescript
Дебиторская задолженность (Accounts Receivable)
  Prior AR
  + Revenue (из ОПиУ)
  - Cash Collections (разница)
  = Ending AR
  DSO = (AR / Revenue) × 365

Запасы (Inventory)
  Prior Inventory
  + Purchases (разница)
  - COGS (из ОПиУ)
  = Ending Inventory
  DIO = (Inventory / COGS) × 365

Кредиторская задолженность (Accounts Payable)
  Prior AP
  + Purchases (из расчета Inventory)
  - Cash Payments (разница)
  = Ending AP
  DPO = (AP / COGS) × 365

Net Working Capital (NWC) = AR + Inventory - AP
ΔWC = Current NWC - Prior NWC
```

## График Амортизации (D&A Schedule)

```typescript
Начальная стоимость ОС (Beginning PP&E Gross)
+ Капитальные затраты (CapEx)
= Конечная стоимость ОС (Ending PP&E Gross)

Начальная накопленная амортизация
+ Расход по амортизации за период
= Конечная накопленная амортизация

ОС (Net PP&E) = Gross PP&E - Accumulated Depreciation
```

## График Кредитов и Займов (Debt Schedule)

```typescript
Начальный баланс долга
+ Новые займы
- Погашение долга
= Конечный баланс долга

Процентные расходы = Средний баланс долга × Процентная ставка
  (Используйте начальный баланс, чтобы избежать цикла, или ограничьте итерации в коде)
```

## Формула Нераспределенной Прибыли (Retained Earnings)

```typescript
Начальная Нераспределенная прибыль
+ Net Income (из ОПиУ)
+ Stock-Based Compensation (SBC) (из ОПиУ)
- Дивиденды
= Конечная Нераспределенная прибыль
```

## Структура Баланса (Balance Sheet Structure)

```typescript
АКТИВЫ (ASSETS)
  Cash (из CF ending cash)
  Accounts Receivable (из WC)
  Inventory (из WC)
  Total Current Assets
  
  PP&E, Net (из DA)
  Deferred Tax Asset - NOL
  Total Non-Current Assets
  Total Assets

ОБЯЗАТЕЛЬСТВА (LIABILITIES)
  Accounts Payable (из WC)
  Current Portion of Debt (из Debt)
  Total Current Liabilities
  
  Long-Term Debt (из Debt)
  Total Liabilities

КАПИТАЛ (EQUITY)
  Common Stock
  Retained Earnings (из RE schedule)
  Total Equity

ПРОВЕРКА: Assets - Liabilities - Equity === 0
```

## Структура ОДДС (Cash Flow Statement Structure)

```typescript
ОПЕРАЦИОННАЯ ДЕЯТЕЛЬНОСТЬ (CFO)
  Net Income (ЛИНК: ОПиУ)
  + D&A (ЛИНК: график DA)
  + Stock-Based Compensation (SBC) (ЛИНК: ОПиУ)
  - ΔDTA (Deferred Tax Asset)
  - ΔAR (ЛИНК: WC)
  - ΔInventory (ЛИНК: WC)
  + ΔAP (ЛИНК: WC)
  = CFO

ИНВЕСТИЦИОННАЯ ДЕЯТЕЛЬНОСТЬ (CFI)
  - CapEx (ЛИНК: график DA)
  = CFI

ФИНАНСОВАЯ ДЕЯТЕЛЬНОСТЬ (CFF)
  + Привлечение долга (ЛИНК: Debt)
  - Погашение долга (ЛИНК: Debt)
  + Эмиссия акций (ЛИНК: BS Common Stock)
  - Выплата дивидендов (ЛИНК: график RE)
  = CFF

Изменение Кэша = CFO + CFI + CFF
Начальный Кэш
+ Изменение Кэша
= Конечный Кэш (ЛИНК НА: BS Cash)
```

## Структура ОПиУ (Income Statement Structure)

```typescript
Net Revenue
  Growth %
(-) Cost of Revenue
  % of Net Revenue
────────────────
Gross Profit (= Net Revenue - Cost of Revenue)
  Gross Margin %

(-) S&M
  % of Net Revenue
(-) G&A
  % of Net Revenue
(-) R&D
  % of Net Revenue
(-) D&A
(-) SBC
  % of Net Revenue
────────────────
EBIT
  EBIT Margin %

EBITDA
  EBITDA Margin %

(-) Interest Expense
────────────────
EBT (Pre-Tax Income)
(-) NOL Utilization
────────────────
Taxable Income
(-) Taxes (Taxable Income × Tax Rate)
────────────────
Net Income
  Net Income Margin %
```

## Формулы Проверок (Check Formulas)

```typescript
BS Balance Check:       = Assets - Liabilities - Equity  (должно быть 0)
Cash Tie-Out:           = BS Cash - CF Ending Cash       (должно быть 0)
RE Roll-Forward:        = Prior RE + NI + SBC - Div - BS RE  (должно быть 0)
Equity Raise Tie-Out:   = ΔCommon Stock/APIC (BS) - Equity Issuance (CFF)  (должно быть 0)
Year 0 Equity Tie-Out:  = Equity Raised (Year 0) - Beginning Equity (Year 1)  (должно быть 0)
Cash Monthly vs Annual: = Closing Cash (Monthly) - Closing Cash (Annual)  (должно быть 0)
```
