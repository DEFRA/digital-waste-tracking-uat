# Waste Movement Receipt API - Glossary of Terms

This glossary defines the key terms and phrases used consistently across the Waste Movement Receipt API feature files to ensure clear communication and maintain consistency in test scenarios.

## Core Entities

### Waste Receiver
- **Definition**: An authenticated user who submits waste movement receipts to the system
- **Usage**: "As a waste receiver", "an authenticated waste receiver"
- **Context**: The primary actor in waste movement receipt submission scenarios

### Waste Movement Receipt
- **Definition**: A digital record of waste being received at a specific site via the /movements/receive API endpoint
- **Usage**: "submit waste movement receipts", "waste movement receipt submission", "submit a waste movement receipt"
- **Context**: The main business object and API operation for creating waste receipt records

## Authentication Terms

### Authentication Header
- **Definition**: The HTTP header containing authentication credentials
- **Usage**: "valid authentication header", "invalid authentication header"
- **Variations**: "expired authentication header", "missing authentication header"

### Authentication Status
- **Definition**: The state of authentication credentials
- **Usage**: "valid", "invalid", "expired", "missing"
- **Context**: Used in scenario outlines for testing different authentication states

## Site-Related Terms

### Receiving Site
- **Definition**: A physical location where waste is received
- **Usage**: "Receiving Site registered to my account", "Receiving Site ID"
- **Context**: Must be owned by the authenticated user

### Receiving Site ID
- **Definition**: Unique identifier for a receiving site
- **Usage**: "my Receiving Site ID", "Receiving Site ID I don't own"
- **Context**: Used to validate site ownership and existence

### Site Ownership
- **Definition**: The relationship between a user and a site they are authorized to use
- **Usage**: "owned Site", "unowned Site", "sites registered to my account"
- **Context**: Security validation to prevent unauthorized submissions

## EWC Code Terms

### EWC Code
- **Definition**: European Waste Catalogue code - a 6-digit numeric classification for waste types
- **Usage**: "valid 6-digit EWC code", "EWC code field"
- **Format**: 6-digit numeric (e.g., "010101")
- **Context**: Primary field for waste type classification

### Waste Item
- **Definition**: A data structure containing waste classification information within the waste array
- **Usage**: "waste item with a valid EWC code"
- **Context**: Contains EWC codes, description, form, containers, quantity data, and hazardous properties

### Hazardous Properties
- **Definition**: Properties indicating whether waste contains hazardous substances
- **Usage**: "waste item indicates it contains hazardous properties", "waste item indicates it does not contain hazardous properties"
- **Context**: Determines whether chemical or biological component data is required

### Chemical or Biological Component
- **Definition**: A hazardous substance within the waste item that requires concentration specification
- **Usage**: "chemical or biological component name", "chemical or biological component has a concentration value"
- **Context**: Part of the hazardous properties data structure, requires name and concentration

### Multiple EWC Codes
- **Definition**: Multiple valid EWC codes for a single waste type (mirrored EWC)
- **Usage**: "multiple valid 6-digit EWC codes"
- **Format**: Comma-separated list (e.g., "010101,010102,010103")
- **Context**: Used when waste has multiple classifications

## Response Terms

### Success Responses
- **Definition**: Positive confirmation of successful operations
- **Usage**: "waste movement was created successfully"
- **Context**: Expected outcome for valid submissions

### Error Responses
- **Definition**: Negative responses indicating validation failures
- **Usage**: "waste movement was not created"
- **Context**: Expected outcome for invalid submissions

### Error Messages
- **Definition**: Specific text explaining why an operation failed
- **Usage**: "EWC code is required", "Receiving Site ID is not valid for my account"
- **Context**: Provides actionable feedback to users

## Action Verbs

### Submit
- **Definition**: To send waste receipt data to the API
- **Usage**: "submit the waste movement receipt", "submit waste movement receipts"
- **Context**: Primary action for creating waste receipts

### Attempt
- **Definition**: To try an operation that may fail
- **Usage**: "attempt to submit the waste movement receipt"
- **Context**: Used when testing negative scenarios

## Setup Steps

### Complete Waste Movement Receipt
- **Definition**: A complete waste movement receipt with all required fields populated with valid data
- **Usage**: "I have a complete waste movement receipt with valid base data"
- **Context**: Background step that ensures all scenarios start with a valid, complete request body

### Waste Item Configuration
- **Definition**: Modifying specific properties of the waste item within the receipt
- **Usage**: "the waste item has a valid 6-digit EWC code", "the waste item has no EWC code"
- **Context**: Used to set up specific test conditions while maintaining complete request structure

### Hazardous Properties Configuration
- **Definition**: Modifying hazardous properties and chemical/biological component data within the waste item
- **Usage**: "the waste item indicates it contains hazardous properties", "the chemical or biological component has a concentration value"
- **Context**: Used to set up hazardous waste test conditions and component specifications

### Inform
- **Definition**: To provide feedback to the user about operation results
- **Usage**: "should be informed that", "informed that the waste movement was created"
- **Context**: Describes system responses to user actions

## Validation Terms

### Valid
- **Definition**: Data that meets all business rules and format requirements
- **Usage**: "valid authentication header", "valid EWC code"
- **Context**: Data that should result in successful operations

### Invalid
- **Definition**: Data that violates business rules or format requirements
- **Usage**: "invalid EWC code format", "invalid authentication header"
- **Context**: Data that should result in failed operations

### Missing
- **Definition**: Required data that is not provided
- **Usage**: "missing EWC code", "missing Site ID"
- **Context**: Absence of required fields

### Non-existent
- **Definition**: Data that references entities that don't exist in the system
- **Usage**: "non-existent EWC code", "non-existent Site"
- **Context**: References to entities that cannot be found

## File Naming Convention

Feature files follow the pattern: `waste-receipt-{domain}.feature` (current naming)
- `waste-receipt-authentication.feature`
- `waste-receipt-sites.feature`
- `waste-receipt-ewc-codes.feature`
- `waste-receipt-hazardous-concentration.feature`

Note: File names maintain the "waste-receipt" prefix for consistency with the existing folder structure, while the content uses "Waste Movement Receipt" terminology.

## Tagging Convention

Features are tagged with ticket references:
- `@DWT-381` - EWC Code Validation
- `@DWT-382` - Hazardous Concentration Validation
- `@DWT-480` - Authentication
- `@DWT-481` - Site Validation 