-- Database setup for RoofQuote Canada application
-- PostgreSQL schema

-- Create database (run this separately)
-- CREATE DATABASE roofquote_canada;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    roof_data JSONB, -- Store Google Solar API response
    province VARCHAR(2), -- CA, ON, BC, etc.
    city VARCHAR(100),
    postal_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead submissions table
CREATE TABLE lead_submissions (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    user_id INTEGER REFERENCES users(id),
    user_answers JSONB NOT NULL, -- Questionnaire responses
    price_estimate JSONB NOT NULL, -- Pricing calculation results
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, contacted, converted, closed
    lead_source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roofing contractors table
CREATE TABLE roofing_contractors (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    service_areas TEXT[], -- Array of cities/regions they serve
    specialties TEXT[], -- Types of roofing work
    license_number VARCHAR(100),
    insurance_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2), -- Average rating out of 5
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractor leads table (many-to-many between leads and contractors)
CREATE TABLE contractor_leads (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES lead_submissions(id),
    contractor_id INTEGER REFERENCES roofing_contractors(id),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent', -- sent, viewed, contacted, quoted, won, lost
    lead_cost DECIMAL(10,2), -- Cost charged to contractor for this lead
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing zones table (Canadian provincial pricing)
CREATE TABLE pricing_zones (
    id SERIAL PRIMARY KEY,
    province VARCHAR(2) NOT NULL,
    province_name VARCHAR(100) NOT NULL,
    base_rate_low DECIMAL(5,2) NOT NULL, -- $/sq ft
    base_rate_high DECIMAL(5,2) NOT NULL, -- $/sq ft
    complexity_multiplier_max DECIMAL(3,2) DEFAULT 1.7,
    market_adjustment DECIMAL(3,2) DEFAULT 1.0, -- Regional market adjustment
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roof data cache table (cache Google Solar API responses)
CREATE TABLE roof_data_cache (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    google_response JSONB NOT NULL,
    cache_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_province ON properties(province);
CREATE INDEX idx_lead_submissions_status ON lead_submissions(status);
CREATE INDEX idx_lead_submissions_created ON lead_submissions(created_at);
CREATE INDEX idx_contractor_leads_status ON contractor_leads(status);
CREATE INDEX idx_contractors_active ON roofing_contractors(active);
CREATE INDEX idx_contractors_service_areas ON roofing_contractors USING GIN(service_areas);

-- Add some constraints
ALTER TABLE lead_submissions ADD CONSTRAINT valid_status 
    CHECK (status IN ('pending', 'sent', 'contacted', 'converted', 'closed'));

ALTER TABLE contractor_leads ADD CONSTRAINT valid_lead_status 
    CHECK (status IN ('sent', 'viewed', 'contacted', 'quoted', 'won', 'lost'));

ALTER TABLE pricing_zones ADD CONSTRAINT valid_province 
    CHECK (province IN ('ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU'));
