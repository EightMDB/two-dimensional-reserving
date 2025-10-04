# Actuarial Reserving Methodologies: Comprehensive Regulatory Framework Analysis

## Executive Summary

**The actuarial reserving landscape demands sophisticated, multi-framework compliance.** Insurance companies and actuaries face an extraordinarily complex regulatory environment requiring simultaneous calculations across federal tax requirements (IRS), securities regulations (SEC/GAAP), state statutory accounting (NAIC), and increasingly, international standards (IFRS 17, Solvency II). A modern software platform serving as a comprehensive "one-stop shop" for actuarial reserving must support over 40 distinct methodologies across five insurance lines (life, P&C, health, annuities, reinsurance) and seven major regulatory frameworks.

This analysis consolidates all regulatorily sufficient actuarial reserving methodologies as of 2024-2025, identifying the specific frameworks that accept each method, applicable lines of business, computational approaches, and key regulatory guidance. **The complexity and interdependencies across these frameworks create substantial operational burden for insurers—and a compelling value proposition for integrated software solutions.**

---

## Regulatory Framework Landscape

### United States Federal & State

**IRS (Tax Reserves)** - IRC Sections 807 (Life) and 846 (P&C) govern tax reserves, generally producing reserves 5-25% lower than statutory through the 92.81% factor for life insurance and required discounting for P&C. Post-TCJA (2017) simplifications shifted to valuation-date methodologies.

**SEC/U.S. GAAP** - ASU 2018-12 (LDTI) fundamentally transformed long-duration contract accounting effective 2023, requiring annual assumption updates, market-based discount rates (single-A), and detailed disaggregated rollforward disclosures. Short-duration contracts follow ASC 944 with enhanced claims development triangles.

**NAIC (State Statutory)** - The gold standard for solvency protection. Principle-Based Reserving (PBR) revolutionized life insurance (VM-20, VM-21) and is expanding to fixed annuities (VM-22, expected 2026). P&C reserves follow SSAP 55/65 with prescribed development methods. Health insurance governed by Model #10 with specialized tables for disability and long-term care.

### International Standards

**IFRS 17** - Effective January 2023, establishes three measurement models: General Measurement Model (GMM/Building Blocks Approach), Variable Fee Approach (VFA) for participating contracts, and Premium Allocation Approach (PAA) for short-duration. Introduces explicit Contractual Service Margin (CSM) deferring profit recognition and mandatory risk adjustments.

**Solvency II** - European framework requiring market-consistent valuation with Best Estimate Liabilities plus risk margin (Cost of Capital approach, currently 6%, reducing to 4.75% under 2024 amendments). Stochastic projections support 99.5% VaR capital requirements (SCR). UK diverging to Solvency UK with 4% Cost of Capital.

---

## Methodologies by Regulatory Framework and Line of Business

### Life Insurance & Annuities

#### VM-20: Principle-Based Reserves for Life Products (NAIC Statutory)
- **Products:** Term life, whole life, universal life, variable life, ULSG
- **Approach:** Three-component maximum of Net Premium Reserve (NPR - formulaic floor using 2017 CSO mortality), Deterministic Reserve (DR - single scenario with company prudent estimates), and Stochastic Reserve (SR - CTE 70 across 1,000+ economic scenarios)
- **Effective:** Mandatory January 1, 2020 for new business
- **Key References:** NAIC Valuation Manual VM-20, VM-31 (PBR Actuarial Report), ASOP No. 52

#### VM-21: Principle-Based Reserves for Variable Annuities (NAIC Statutory)
- **Products:** Variable annuities with GMWB, GMIB, GMAB, GMDB; RILAs
- **Approach:** Stochastic (CTE 70) with dual projection using company reinvestment strategy vs. prescribed guardrail (5% Treasury, 15% AA, 40% A, 40% BBB); optional hedging recognition (CDHS)
- **Replaces:** Actuarial Guideline 43 (AG 43)
- **Key References:** NAIC VM-21, ASOP No. 56

#### VM-22: Requirements for Fixed Annuities (NAIC Statutory - In Development)
- **Products:** Fixed indexed annuities, SPIAs, DIAs, MYGAs, MVAs, longevity reinsurance
- **Approach:** Four components - Stochastic Reserve (CTE 70), Standard Projection Amount (prescribed assumptions), Deterministic Certification Option (eligible products), Pre-PBR reserves (if passing SET)
- **Status:** Expected adoption January 1, 2026; mandatory January 1, 2029
- **Key References:** NAIC VM-22 (proposed), field test results Q3 2024

#### CRVM/CARVM: Traditional Formulaic Methods (NAIC Statutory)
- **CRVM (Commissioner's Reserve Valuation Method):** Life insurance issued before PBR or qualifying for exemption; net premium method with prescribed interest rates and CSO mortality tables
- **CARVM (Commissioner's Annuity Reserve Valuation Method):** Fixed annuities; greatest of cash surrender value, present value of guaranteed benefits, or accumulation of considerations
- **Key References:** NAIC Standard Valuation Law Model #820, VM-A, VM-C

#### LDTI (Long Duration Targeted Improvements) - U.S. GAAP
- **Products:** Life insurance, annuities, LTC, individual disability
- **Approach:** Net premium method with cohort-based measurement; assumptions updated annually (mortality, morbidity, lapses); discount rates using upper-medium grade (single-A) fixed income; locked-in for interest accretion, current for balance sheet; discount rate changes flow through OCI
- **Market Risk Benefits (MRB):** Fair value measurement using risk-neutral scenarios for VA guarantees (GMWB, GMIB, etc.)
- **Effective:** January 1, 2023 (SEC filers), January 1, 2025 (others)
- **Key References:** ASU 2018-12, ASC 944-40, SEC Regulation S-X Article 7

#### IRS Tax Reserves for Life Insurance
- **IRC Section 807:** Tax reserve = MAX(Net Surrender Value, 92.81% × NAIC Reserve) capped at statutory; eliminates separate federal mortality/interest tables post-TCJA; deficiency reserves not deductible
- **Special Rules:** VM-20/VM-21 safe harbor with 96% factor for PBR excess (LB&I Directive 8/24/2018)
- **Key References:** IRC §807, Treasury Reg. §1.807-1 to 1.807-4, Rev. Rul. 2020-19

### Property & Casualty Insurance

#### Chain Ladder Method (Development Method)
- **Lines:** All major P&C lines (auto liability, auto PD, workers comp, homeowners, commercial multi-peril, general liability, professional liability, medical malpractice)
- **Approach:** Uses age-to-age development factors from historical claim triangles; Ultimate = Current Cumulative × Link Development Factor (LDF)
- **Frameworks:** NAIC statutory (Schedule P Parts 1A-1P), U.S. GAAP (ASC 944), IFRS 17 (GMM/PAA), Solvency II
- **Key References:** NAIC SSAP No. 55, ASOP No. 43, CAS Berquist & Sherman (1977)

#### Bornhuetter-Ferguson (BF) Method
- **Lines:** All P&C, especially long-tail and immature accident years
- **Approach:** Hybrid method blending chain ladder with a priori expected losses; Ultimate = Reported + (Expected × % Unreported) where % Unreported = (1 - 1/CDF)
- **Frameworks:** NAIC statutory, U.S. GAAP, IFRS 17, Solvency II
- **Key References:** Bornhuetter & Ferguson (1972) "The Actuary and IBNR", CAS monographs

#### Cape Cod Method (Stanard-Bühlmann Method)
- **Lines:** Reinsurance, excess layers, portfolios with changing exposures
- **Approach:** Loss ratio calculated from data rather than selected a priori; Loss Ratio = Σ(Reported) / Σ(Premium × % Reported)
- **Frameworks:** NAIC statutory, U.S. GAAP, IFRS 17, Solvency II
- **Key References:** Stanard (1985), Bühlmann & Straub, CAS papers

#### Loss Development Methods (Paid, Incurred, Reported)
- **Paid Development:** Uses cash payments only; suitable for short-tail lines (auto PD, property, homeowners)
- **Incurred Development:** Paid plus case reserves; suitable for long-tail (liability, workers comp)
- **Reported Claims Development:** Uses claim count triangles; effective for frequency-severity analysis
- **Frameworks:** NAIC statutory (Schedule P Columns 5-20, Part 2), U.S. GAAP, IFRS 17, Solvency II
- **Key References:** NAIC SSAP No. 55, Schedule P instructions

#### Frequency-Severity Methods
- **Lines:** Workers compensation, auto liability, general liability
- **Approach:** Separates into claim frequency and average severity; Ultimate = Ultimate Claim Count × Ultimate Average Severity; allows separate trending
- **Frameworks:** All major frameworks accept when properly documented
- **Key References:** CAS loss reserving papers, ASOP No. 43

#### Expected Loss Ratio (ELR) Method
- **Lines:** All P&C, especially newest accident years and new products
- **Approach:** Ultimate = Earned Premium × Expected Loss Ratio based on pricing, historical experience, or benchmarks
- **Frameworks:** NAIC statutory, U.S. GAAP, IFRS 17, Solvency II
- **Key References:** NAIC Schedule P Column 4 (Net Earned Premium)

#### Stochastic Reserving Methods

**Mack Method (Distribution-Free Chain Ladder)**
- **Approach:** Provides mean squared error of prediction (MSEP) without distributional assumptions; three key assumptions about conditional expectation, variance, independence
- **Output:** Point estimate, standard errors, coefficient of variation
- **Use:** Reserve ranges, risk-based capital, Statement of Actuarial Opinion (SAO)
- **Key References:** Mack (1993), CAS monographs

**Bootstrap Method (ODP, Mack Bootstrap, BF Bootstrap)**
- **Approach:** Resampling technique generating full predictive distribution; 10,000+ iterations producing percentiles (75th, 90th, 95th, 99th), VaR, TVaR
- **Use:** ORSA, reserve ranges, Solvency II quantification
- **Key References:** England & Verrall (1999, 2002), Shapland (2016) ODP Bootstrap guide

**Collective Risk Model**
- **Approach:** Frequency-severity with stochastic components; compound distributions
- **Frameworks:** Recognized under ASOP No. 43 as valid approach
- **Key References:** CAS literature, academic research

#### P&C Discounting Practices
- **General Rule:** P&C reserves **shall not be discounted** under NAIC statutory and U.S. GAAP
- **Exceptions:** 
  - **Tabular discounting** (workers comp, LTD): Fixed determinable payments with life contingencies; approved mortality tables; state-specific discount rates
  - **Non-tabular** (rare): Requires domiciliary state approval per ASOP No. 20
- **IRS Tax:** **Required discounting** under IRC §846 using corporate bond yield curve (3.18% for 2024) and IRS loss payment patterns
- **Key References:** NAIC SSAP No. 65 ¶11-15, ASOP No. 20, IRC §846

#### P&C Reserve Components
- **Case Reserves:** Adjuster estimates for reported individual claims
- **IBNR (Incurred But Not Reported):** Pure IBNR + IBNER (development on known claims)
- **Bulk Reserves:** Formula-based aggregate reserves
- **Unearned Premium Reserves (UPR):** Pro-rata for standard policies; three tests for long-duration (≥13 months)
- **Premium Deficiency Reserves:** When UPR insufficient (NAIC SSAP No. 53, GAAP ASC 944-60)

### Health Insurance

#### IBNR Claims Reserves - Health Specific Methods
- **Products:** Medical, dental, vision, pharmacy (all short-duration health)
- **Approaches:**
  - **Completion Factor Method:** Most common; uses claims lag triangles; typical patterns: Month 1 (30-40% complete), Month 3 (80-85%), Month 12 (95-98%)
  - **Chain Ladder:** Shorter development (6-24 months) vs. P&C
  - **Bornhuetter-Ferguson:** For immature periods
  - **Predictive Analytics:** Member-level models using demographics, HCC risk scores, RxGroups, diagnosis codes
- **Frameworks:** NAIC Model #10, ASC 944, ACA MLR requirements, IFRS 17 (PAA), Solvency II
- **Key Differences:** Much shorter lag (weeks vs. years), higher frequency/lower severity, pronounced seasonality
- **Key References:** NAIC Model #10 Section 2, SOA "Statistical Methods for Health Actuaries" (2007), ASOP No. 5

#### Medical Loss Ratio (MLR) and Reserve Adequacy Testing
- **Products:** ACA-compliant medical plans
- **Standards:** Individual/Small Group ≥80%, Large Group ≥85% (3-year rolling average)
- **Formula:** MLR = (Incurred Claims + Quality Improvement) / Earned Premium
- **Requirements:** Annual MLR filing, actuarial attestation, reserve adequacy validation
- **Impact:** $1.1B in rebates 2024; $13B total 2012-2024
- **Key References:** ACA Section 2718, 45 CFR Part 158, CMS guidance

#### Medicare Advantage and Medicaid Reserves
- **Medicare Advantage:** Risk adjustment using CMS-HCC V28 model; bid process reserves; Star Ratings quality metrics; IRA Part D redesign impacts (2025); encounter data-driven
- **Medicaid Managed Care:** 85% federal minimum MLR; actuarially sound capitation rates; dual eligibles and LTSS populations
- **Key References:** 42 CFR 422, 423 (MA), 42 CFR 438 (Medicaid), CMS Final Rules, ASOP No. 49

#### Pharmacy Benefit Reserves
- **Components:**
  - **Claims IBNR:** Shorter lag (days/weeks); 85-95% complete month 1
  - **Manufacturer Rebates Receivable:** 90-120 day lag; 70-80% of total value
  - **DIR (Direct/Indirect Remuneration):** Post-POS adjustments, network performance
  - **Specialty Drug Reserves:** High-cost biologics ($10K-$500K+ per fill)
- **IRA Impacts (2022):** Part D redesign (2025), manufacturer negotiation, insulin $35 cap
- **Key References:** 42 CFR 423 (Part D), NAIC Model #10, ACA MLR inclusion

#### Disability Income Reserves

**Group Long-Term Disability (GLTD)**
- **Valuation Standard:** 2012 GLTD Termination Table (replaces 1987 CGDT)
- **Approach:** Active life (1-year preliminary term) + Claim reserves (PV future benefits using continuation probabilities) + Waiver of premium
- **Products:** Group LTD with 2+ year benefit periods
- **Key References:** NAIC Model #10, AG XLVII, 2012 GLTD Experience Study

**Individual Disability Income (IDI)**
- **Valuation Standard:** 2013 IDI Valuation Table (2013 IDIVT, effective 8/2016)
- **Approach:** 2-year preliminary term; net premium method; tabular disabled life reserves; credibility adjustments blending company experience with base table
- **Products:** Non-cancellable, guaranteed renewable individual DI
- **Key References:** NAIC Model #10, AG XLVIII, 2013 IDI Experience Study

#### Long-Term Care Insurance Reserves
- **Products:** LTC insurance (standalone, combo/hybrid)
- **Approach:** 1-year or 2-year preliminary term net level premium reserves; no prescribed morbidity table (company experience preferred); lapse rate caps; mortality using annuitant tables; significant premium deficiency testing given historical pricing inadequacy
- **Special Considerations:** Rate increase approval required; historical under-pricing led to 100-500%+ cumulative rate increases; VM-25 (PBR for LTC) under development
- **Key References:** NAIC Model #10 (LTC amendments), Model #641, ASOP No. 18 (2022), SOA LTC Intercompany Studies

#### Stop-Loss and Health Reinsurance Reserves
- **Stop-Loss:** Specific (individual attachment $50K-$500K) and Aggregate (120-125% corridor); longer tail than primary health; special considerations for lasering, inuring reinsurance
- **Health Reinsurance:** Quota share, excess of loss, HMO/provider excess; ceding company tracks gross/ceded/net reserves; reinsurer reserves similar methods with data lag challenges
- **Key References:** State-specific regulations, ASC 944 Chapter 8, NAIC Model #785, SSAP No. 62R

### Cross-Cutting Methodologies

#### Discounted Cash Flow (DCF) Methods
- **Applications:** Embedded Value calculations, asset adequacy testing, economic capital, IFRS 17 fulfilment cash flows, Solvency II best estimate liabilities
- **Not Primary Method:** Not used for U.S. statutory reserves (except specific exceptions) or U.S. GAAP reserves (except LDTI discount rate application)
- **Key to International:** Central to IFRS 17 and Solvency II frameworks

#### Stochastic Reserving (General Category)
- **Applications:** VM-20 SR, VM-21 SR, VM-22 SR (proposed), Solvency II SCR, ORSA, economic capital, reserve ranges
- **Common Measures:** CTE (Conditional Tail Expectation), VaR (Value at Risk), TVaR (Tail VaR)
- **Scenario Generators:** NAIC GOES (effective 2026), AAA Interest Rate Generator (legacy), proprietary ESGs
- **Key References:** Multiple across frameworks

---

## International Standards Application

### IFRS 17 Measurement Models

#### General Measurement Model (GMM) / Building Blocks Approach
- **Products:** Traditional life insurance (whole, term, endowments without DPF), long-term health, non-participating annuities, reinsurance
- **Components:** Fulfilment Cash Flows (FCF) = PV future cash flows (unbiased, probability-weighted) + Risk Adjustment for non-financial risk + Contractual Service Margin (CSM - unearned profit)
- **Discount Rates:** Bottom-up (risk-free + illiquidity premium, 74% of insurers) or Top-down (asset yield - credit risk); current rates for balance sheet, locked-in for CSM adjustments
- **Risk Adjustment Methods:** Cost of Capital (6% rate typical), VaR, CTE, Margin for Adverse Deviation
- **Key References:** IFRS 17 ¶29-52, B80-B81, B91, B119

#### Variable Fee Approach (VFA)
- **Products:** Unit-linked life, segregated funds, participating/with-profits, variable annuities with DPF, index-linked contracts
- **Eligibility:** Policyholder participates in clearly identified pool; substantial share of fair value returns; substantial proportion varies with underlying items
- **Key Difference:** CSM adjusted for entity's share of fair value changes using **current discount rates** (not locked-in like GMM)
- **Key References:** IFRS 17 ¶45, B101-B118

#### Premium Allocation Approach (PAA)
- **Products:** P&C (auto, homeowners, commercial property), general insurance, short-term health, marine, professional liability, workers comp (annual)
- **Eligibility:** Coverage period ≤1 year (automatic) OR reasonable expectation PAA not materially different from GMM
- **Simplification:** No CSM; Liability for Remaining Coverage (LRC) based on premiums; Liability for Incurred Claims (LIC) measured same as GMM
- **Key References:** IFRS 17 ¶53-59

#### IFRS 17 Key Concepts
- **Level of Aggregation:** Portfolio → Profitability Groups (onerous/no significant possibility/remaining) → Annual Cohorts (minimum)
- **Onerous Contracts:** Immediate loss recognition; loss component tracked separately; subsequent favorable changes allocated to loss component first
- **Contract Boundary:** Cash flows within boundary when entity has substantive obligation; ends when can reassess/reprice
- **Key References:** IFRS 17 ¶14-24, ¶47-52, ¶34, B61-B71

### Solvency II Reserving

#### Technical Provisions Calculation
- **Formula:** Technical Provisions = Best Estimate Liabilities (BEL) + Risk Margin
- **BEL Approach:** Probability-weighted average of future cash flows discounted using risk-free rates (EIOPA publishes monthly)
- **Methodology:** Deterministic for simple products; stochastic Monte Carlo for complex products with guarantees/options
- **Key References:** Directive 2009/138/EC Articles 76-86, Delegated Regulation 2015/35 Articles 48-69

#### Risk Margin Calculation
- **Method:** Cost of Capital approach
- **Formula:** RM = CoC × Σ SCR(t) / (1+r(t))^t
- **Current CoC Rate:** 6% (Article 39); reducing to 4.75% under 2024 EU amendments (expected 2026); UK at 4% (2023)
- **Impact:** ~65% reduction for long-term life, ~30% for non-life
- **Key References:** Delegated Regulation Article 39, EIOPA Guidelines

#### Discount Rates
- **Source:** EIOPA publishes monthly risk-free rate curves by currency
- **Derivation:** Swap rates minus Credit Risk Adjustment (0.10-0.35%); Smith-Wilson extrapolation to Ultimate Forward Rate (EUR 3.30% in 2024)
- **Key References:** Articles 43-47 Delegated Regulation, Article 77a Directive

#### Solvency II Adjustments
- **Matching Adjustment (MA):** For long-term illiquid portfolios (annuities); spread minus fundamental spread; requires strict asset-liability matching; cannot use with VA
- **Volatility Adjustment (VA):** 65% of risk-corrected currency spread (increasing to 85% under 2024 amendments); dampens short-term volatility; broader application than MA
- **Transitional Measures:** TMTP (16-year phase-in 2016-2032); ~43.75% remaining as of end-2024; linear amortization
- **Key References:** Articles 77b, 77d-77e, 308d Directive; EIOPA monthly publications

#### Solvency Capital Requirement (SCR) Linkage
- **SCR Formula:** BSCR (Basic SCR) + Operational Risk - Loss-Absorbing Capacity Adjustment
- **Standard Formula vs Internal Models:** Articles 103-111 (SF) vs. 112-127 (IM); Internal Models require regulatory approval
- **Reserve Impact:** BEL used in underwriting risk modules (premium/reserve risk); Risk Margin mathematically derived from future SCRs; MCR (Minimum Capital Requirement) linear function of technical provisions
- **Measure:** 99.5% VaR over 1-year horizon
- **Key References:** Articles 100-127 Directive, Articles 83-217 Delegated Regulation

---

## Comprehensive Methodology Matrix

### By Regulatory Framework and Line of Business

| **Methodology/Model** | **Acronym** | **Regulatory Framework** | **Life** | **P&C** | **Health** | **Annuities** | **Reinsurance** | **Approach** |
|----------------------|-------------|-------------------------|----------|---------|-----------|---------------|----------------|--------------|
| **VM-20 PBR** | VM-20 | NAIC Statutory | ● | | | | ● | NPR + MAX(DR, SR) |
| **VM-21 VA Reserves** | VM-21 | NAIC Statutory | | | | ● | | CTE 70 Stochastic |
| **VM-22 Fixed Annuities** | VM-22 | NAIC Statutory (2026+) | | | | ● | | CTE 70/DR/Pre-PBR |
| **CRVM** | CRVM | NAIC Statutory (Legacy) | ● | | | | | Net Premium Method |
| **CARVM** | CARVM | NAIC Statutory | | | | ● | | Greatest of Tests |
| **Chain Ladder** | N/A | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Development Factors |
| **Bornhuetter-Ferguson** | BF | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Hybrid Expected/Actual |
| **Cape Cod** | N/A | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Data-Driven Loss Ratio |
| **Frequency-Severity** | N/A | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Claim Count × Severity |
| **Expected Loss Ratio** | ELR | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Premium × Expected LR |
| **Mack Method** | N/A | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Stochastic MSEP |
| **Bootstrap Method** | ODP/Mack | NAIC, GAAP, IFRS 17, SII | | ● | ● | | ● | Resampling/Full Dist |
| **Completion Factor** | N/A | NAIC, GAAP | | | ● | | | Lag Triangles |
| **2012 GLTD Table** | GLTD | NAIC Statutory | | | ● | | | Disabled Life Reserves |
| **2013 IDI Table** | IDIVT | NAIC Statutory | | | ● | | | Tabular + Credibility |
| **LTC Model #10** | N/A | NAIC Statutory | | | ● | | | Net Level Premium |
| **LDTI Net Premium** | LDTI | U.S. GAAP | ● | | ● | ● | | Updated Assumptions |
| **LDTI MRB Fair Value** | MRB | U.S. GAAP | | | | ● | | Risk-Neutral Scenarios |
| **Short-Duration GAAP** | ASC 944 | U.S. GAAP | | ● | ● | | ● | Best Estimate IBNR |
| **Premium Deficiency** | PDR | GAAP/SAP | | ● | ● | | | Cash Flow Test |
| **IRC 807 Tax** | N/A | IRS | ● | | ● | ● | | 92.81% × NAIC |
| **IRC 846 Discounting** | N/A | IRS | | ● | ● | | ● | Corporate Bond Curve |
| **IFRS 17 GMM/BBA** | GMM/BBA | IFRS 17 | ● | | ● | ● | ● | FCF + RA + CSM |
| **IFRS 17 VFA** | VFA | IFRS 17 | ● | | | ● | | CSM Adjusted Current |
| **IFRS 17 PAA** | PAA | IFRS 17 | | ● | ● | | ● | Simplified LRC/LIC |
| **Solvency II BEL** | BEL | Solvency II | ● | ● | ● | ● | ● | PV Cash Flows |
| **Solvency II Risk Margin** | RM | Solvency II | ● | ● | ● | ● | ● | Cost of Capital |
| **Solvency II SCR-SF** | SCR | Solvency II | ● | ● | ● | ● | ● | 99.5% VaR Standard |
| **Solvency II Internal Model** | IM | Solvency II | ● | ● | ● | ● | ● | 99.5% VaR Custom |

**Legend:** ● = Applicable | Blank = Not applicable

---

## Key Regulatory Reference Documents

### United States

**NAIC (State Statutory)**
- Standard Valuation Law (Model #820)
- Valuation Manual (VM-A through VM-51) - Annual updates
- Health Insurance Reserves Model Regulation (Model #10)
- Statements of Statutory Accounting Principles: SSAP 53, 55, 62R, 65
- Actuarial Guidelines: AG XLVII (GLTD), AG XLVIII (IDI), AG ReAAT
- Annual Statement Schedule P (P&C), Schedule E (Health)

**U.S. GAAP / SEC**
- ASU 2018-12: Long Duration Targeted Improvements (LDTI)
- ASC 944: Financial Services - Insurance
- ASC 944-40: Liabilities for Future Policy Benefits
- ASC 944-60: Premium Deficiency Testing
- SEC Regulation S-X Article 7: Insurance Company Financial Statements
- ASU 2015-09: Short-Duration Claims Development Disclosures

**IRS (Tax)**
- IRC Section 807: Life Insurance Company Tax Reserves
- IRC Section 846: P&C Discounted Unpaid Losses
- Treasury Regulations §1.807-1 to 1.807-4, §1.846-1 to 1.846-4
- Revenue Ruling 2020-19: Basis Changes
- Revenue Procedure 2025-15: Annual Discount Factors
- LB&I Directive (August 24, 2018): VM-20/VM-21 Safe Harbor

**ACA / CMS**
- ACA Section 2718: Medical Loss Ratio Requirements
- 45 CFR Part 158: MLR Reporting and Rebates
- 42 CFR 422, 423: Medicare Advantage and Part D
- 42 CFR 438: Medicaid Managed Care (2016 Rules)
- CMS Annual MA Final Rules

**Actuarial Standards of Practice (ASB)**
- ASOP No. 5: Incurred Health and Disability Claims
- ASOP No. 18: Long-Term Care Insurance (2022)
- ASOP No. 20: Discounting
- ASOP No. 22: Asset Adequacy Analysis
- ASOP No. 36: Statements of Actuarial Opinion (2024)
- ASOP No. 43: Property/Casualty Unpaid Claim Estimates
- ASOP No. 49: Medicaid Managed Care Capitation Rates
- ASOP No. 52: Principle-Based Reserves for Life Products
- ASOP No. 56: Modeling

### International

**IFRS 17**
- IFRS 17 Insurance Contracts (IFRS Foundation, effective January 1, 2023)
- Basis for Conclusions (BC)
- June 2020 Amendments (deferred effective date, simplified transition)
- IFRS Transition Resource Group (TRG) Materials

**Solvency II**
- Directive 2009/138/EC (Solvency II Directive)
- Delegated Regulation (EU) 2015/35 (Technical Standards)
- EIOPA Guidelines on Valuation of Technical Provisions
- EIOPA Monthly Technical Information (RFR curves, VA, MA, fundamental spreads)
- Directive 2024 Amendments (CoC 4.75%, VA 85%, expected 2026)

**UK Solvency UK**
- PRA Rulebook Solvency II Firms
- Supervisory Statement SS3/24, SS11/24 (November 2024)
- Policy Statement PS2/24 (Internal Models, TMTP Simplification)
- 4% Cost of Capital (effective 2023)

---

## Platform Value Proposition

### The Actuarial Reserving Challenge

Insurance companies face **unprecedented computational and regulatory complexity**:

**Multi-Framework Compliance:** A single life insurance company must simultaneously calculate reserves under VM-20 (NAIC statutory), LDTI (U.S. GAAP for investor reporting), IRC Section 807 (federal tax), and potentially IFRS 17 (international parent). Each framework demands distinct assumptions, discount rates, aggregation levels, and computational approaches.

**Methodological Diversity:** The industry employs over 40 distinct methodologies spanning deterministic formula-based approaches (CRVM, CARVM), development methods (chain ladder, BF, Cape Cod), stochastic projections (CTE 70, VaR 99.5%), and hybrid frameworks. No single calculation engine suffices.

**Data Infrastructure Requirements:** Compliance demands seriatim policy-level detail for life PBR, 10-year claims triangles for P&C Schedule P reporting, cohort-based tracking for LDTI rollforwards, member-level analytics for health IBNR, and monthly discount curve updates for IFRS 17 and Solvency II.

**Evolving Standards:** VM-22 implementation (2026-2029), NAIC Generator of Economic Scenarios (GOES) adoption (2026), Solvency II 2024 amendments (2026), ongoing LDTI refinements, and Medicare Advantage V28 CMS-HCC transitions create continuous adaptation requirements.

**Resource Intensity:** Actuarial departments maintain disparate systems: statutory valuation engines, GAAP subledgers, tax calculation workbooks, regulatory reporting platforms, assumption governance databases, and experience study tools. Integration gaps necessitate manual reconciliation, creating operational risk and audit exposure.

### The Integrated Platform Solution

A comprehensive **"one-stop shop" actuarial reserving platform** addresses these challenges through:

**Unified Data Architecture:** Single source of truth for policy/claim data feeding all regulatory calculations; automated cohort assignment and aggregation rule engines; centralized assumption libraries with version control and audit trails.

**Multi-Framework Calculation Engines:** 
- Life/Annuities: VM-20 (NPR/DR/SR), VM-21 (CTE 70 with hedging), VM-22 (proposed framework), LDTI (net premium with annual updates), CRVM/CARVM (legacy)
- P&C: Development methods (chain ladder, BF, Cape Cod, frequency-severity), stochastic reserving (Mack, Bootstrap ODP), Schedule P automation, discounting (tabular, IRC 846)
- Health: Completion factors, IBNR methodologies, MLR tracking, MA/Medicaid bid support, pharmacy rebate reserves, disability/LTC tables
- Tax: IRC 807 (92.81% calculation, NSV comparison), IRC 846 (discount factor application), reconciliation to statutory
- International: IFRS 17 (GMM/VFA/PAA with CSM tracking, fulfilment cash flows, risk adjustment), Solvency II (BEL, risk margin, SCR integration)

**Stochastic Modeling Infrastructure:** Integrated scenario generation (NAIC GOES, proprietary ESGs); distributed computing for CTE 70/VaR calculations; deterministic reserve testing (SERT, DET); sensitivity analysis and assumption stress testing.

**Regulatory Reporting Automation:** NAIC Annual Statement (Schedule P, E, H); SEC 10-K/10-Q LDTI rollforwards and disclosures; IRS Form 1120-L/PC reconciliation; CMS MLR filings and rebate calculations; IFRS 17 disaggregated disclosures; Solvency II QRTs and SFCR.

**Assumption Governance Workflow:** Experience study integration; credibility calculations; margin calibration tools; assumption change approval tracking; documentation generation for PBR Actuarial Reports (VM-31), LDTI actuarial memoranda, SAO support.

**Reconciliation and Controls:** Multi-basis reserve bridges (statutory to GAAP to tax to IFRS); automated variance analysis; audit trail for all calculations; user access controls and model validation frameworks.

**Scalability and Performance:** Cloud-native architecture supporting thousands of policies and millions of claims; parallel processing for stochastic calculations; real-time reserve estimates; what-if scenario modeling for business planning.

### Market Positioning

The platform targets:
- **Life insurance carriers** transitioning to full VM-20 compliance and managing LDTI implementation
- **P&C insurers** seeking to automate Schedule P and adopt stochastic reserving for ORSA/ERM
- **Health insurers** navigating ACA MLR, MA/Medicaid growth, and pharmacy benefit complexity
- **Multinational insurers** requiring IFRS 17 and Solvency II alongside U.S. frameworks
- **Reinsurers** managing ceded/assumed calculations across multiple frameworks and geographies
- **Regulatory consultancies** supporting clients across jurisdictions

By consolidating disparate reserving processes into a single integrated platform supporting all major methodologies across all regulatory frameworks, the solution delivers **operational efficiency, regulatory confidence, audit readiness, and strategic agility** in an increasingly complex actuarial environment.

---

## Conclusion

The actuarial reserving landscape spans seven major regulatory frameworks (NAIC, IRS, SEC/GAAP, ACA, IFRS 17, Solvency II, Solvency UK) and over 40 distinct methodologies across five insurance lines (life, P&C, health, annuities, reinsurance). **No single methodology satisfies all frameworks**—instead, insurers must maintain parallel calculations with framework-specific assumptions, discount rates, aggregation rules, and computational approaches.

The 2020s represent a transformational decade: Principle-Based Reserving (VM-20, VM-21, VM-22) replaces formulaic statutory methods, LDTI revolutionizes U.S. GAAP accounting, IFRS 17 establishes global consistency with CSM-based profit recognition, and Solvency II evolves with reduced risk margin and enhanced volatility adjustments. Actuarial departments require sophisticated technology infrastructure to deliver compliant, auditable reserves across this multi-framework environment.

**A comprehensive actuarial reserving software platform supporting all regulatorily sufficient methodologies represents not just operational convenience but strategic necessity** for modern insurance enterprises navigating the complexity of 2024-2025 regulatory requirements and positioning for continued evolution through the end of the decade.