# Product Requirements Document (PRD): Avarion - AI Fashion & Virtual Makeover Studio

**Created:** 2026-10-10  
**Category:** Feature / Web Application  
**Status:** Approved
**Aesthetic Direction:** Minimal Editorial Neutral  
**Target Platform:** Web (Desktop & Mobile Responsive) -> Native Mobile (iOS/Android Future)  
**Budget Tier:** Zero-cost / Free Tier MVP (Client-side 2D Interactive Avatar Canvas & Express Service)

---

## 1. Executive Summary & Problem Statement

Users often struggle with visualizing how clothes, shoes, and makeup will look together on their actual body type before purchasing online. Existing e-commerce stores (Amazon, Flipkart, Myntra) display clothing on professional studio models, resulting in high return rates, buyer hesitation, and mismatched outfits.

**Avarion** is an AI-powered virtual fashion makeover studio. It creates a customized 3D human mannequin matching user body measurements and features, enables interactive full-body try-ons (makeup, outfits, footwear) tailored to occasions/events, and seamlessly connects users to major e-commerce platforms (Amazon, Flipkart, Myntra) with affiliate tracking.

---

## 2. Core User Personas & Demographics

- **Target Audience:** All genders, ages 16–45+, looking for outfit inspiration, event styling, and personalized virtual fit.
- **Budget Consciousness:** High accessibility (fast performance on mobile web browsers, zero app-store download hurdle initially).
- **Key Occasions:** Everyday casual, college/fest, corporate/formal, festive/wedding, party/night out.

---

## 3. Core User Journeys & Flows

### Flow 1: Onboarding & 3D Mannequin Generation
1. User enters basic data or measurements (Gender presentation, Height, Chest/Bust, Waist, Hips, Inseam, Skin Undertone).
2. The client-side Three.js parametric body model instantaneously deforms into a 3D avatar reflecting those exact dimensions.
3. User can inspect the 3D avatar with 360-degree rotation, zoom, and lighting adjustments.
4. Mannequin profile is saved to localStorage/profile state.

### Flow 2: Virtual Wardrobe & Occasion-Based Styling
1. User selects an occasion (Fest, Formal, Wedding, Casual Date).
2. The recommendation engine surfaces curated trending capsules (tops, bottoms, dresses, footwear, makeup palettes).
3. User clicks any garment or makeup style:
   - Garments attach to the 3D mannequin using modular layers (skin -> inner layer -> outer layer -> footwear).
   - Face makeup decals/shaders update lip color, blush, and eyeliner tones.
4. User can mix-and-match items into their "Virtual Wardrobe".

### Flow 3: Affiliate E-commerce Handoff & Cart Handoff
1. Once the look is finalized, the app summarizes the complete outfit (Total Estimated Price, Individual item breakdown).
2. Each item displays direct purchase links to Flipkart, Amazon, and Myntra.
3. User clicks "Buy on Myntra / Amazon / Flipkart":
   - Redirects to product detail/cart page with affiliate tracking tag appended.
   - Saves outfit to "Lookbook" history.

---

## 4. Feature Breakdown & Scope Boundaries

### In-Scope (MVP)
1. **Interactive 3D Parametric Mannequin:**
   - Real-time morphing via Three.js (mesh scaling/deformation for height, chest, waist, hips, skin color).
   - Orbit controls (360° pan, rotate, zoom).
2. **Modular Wardrobe & Try-On System:**
   - Layered asset system: Tops, Bottoms, Full-length dresses, Footwear, and Makeup accents.
   - Dynamic texture and color adjustments.
3. **Trending & Event-Based Outfit Recommendations:**
   - Filter by Occasion (College Fest, Office Formal, Festive/Traditional, Casual).
   - Trend badges ("Trending Now", "Classic", "Monochrome").
4. **Affiliate Product Integration:**
   - Structured product catalog with affiliate tracking URLs for Amazon, Flipkart, Myntra.
   - Price breakdown and one-click redirect.
5. **Saved Looks & Virtual Wardrobe:**
   - Ability to save outfits to local collection and export/share snapshot card.

### Explicitly Out of Scope (Deferred to Post-Funding / Phase 2)
- Heavy server-side photogrammetry or neural SMPL mesh reconstruction clusters requiring cloud GPUs.
- Automated browser scraping or headless cart injection bypassing e-commerce security gates.
- Paid proprietary trend APIs (using curated algorithmic trend feeds for MVP).
- Native iOS / Android builds (PWA / Mobile web first).

---

## 5. Key Architecture & Design Decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **3D Engine** | Client-Side Three.js | Zero cloud GPU cost, runs smoothly in browser on modern laptops & phones. |
| **Try-On Architecture** | 3D Modular Mesh Layering | Interactive, low-latency, real-time fit preview matching user sliders. |
| **Affiliate Strategy** | Deep Linking + Affiliate Tags | Reliable, compliant with Amazon/Flipkart policies, works without enterprise API approval. |
| **Storage & State** | LocalStorage + Express Backend | Free hosting compatible (Vercel/Render), no heavy DB overhead for MVP. |

---

## 6. Success Metrics & Validation
- **Engagement:** Time spent in 3D Studio (>2 minutes avg session).
- **Try-On Interaction:** Minimum 3 outfit changes per user session.
- **Conversion / Outbound Clicks:** Click-Through Rate (CTR) to partner e-commerce stores (>12%).
- **Performance:** 3D mannequin initial render time < 1.5s on 4G/WiFi.
