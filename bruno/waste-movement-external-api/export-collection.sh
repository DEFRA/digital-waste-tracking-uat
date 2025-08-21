#!/bin/bash

# Bruno Collection Export Script
# Exports the collection to a shareable folder, excluding sensitive environment files

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
COLLECTION_NAME="Digital-Waste-Tracking-External-API"
EXPORT_DIR="${SCRIPT_DIR}/${COLLECTION_NAME}"
ZIP_FILE="${SCRIPT_DIR}/${COLLECTION_NAME}.zip"

# Files and directories to exclude from export (internal-only environments and system files)
EXCLUDE_LIST=(
    "environments/1) dev-environment.bru"
    "environments/2) test-environment.bru"
    "environments/3) perf-test-environment.bru"
    ".git"
    "node_modules"
    "*.log"
    "*.tmp"
    ".DS_Store"
    "Thumbs.db"
    "${COLLECTION_NAME}"
    "$(basename "${ZIP_FILE}")"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}



# Function to export collection
export_collection() {
    print_status "Starting collection export..."
    
    # Clean up previous export if it exists
    if [ -d "$EXPORT_DIR" ]; then
        print_status "Removing previous export directory..."
        rm -rf "$EXPORT_DIR"
    fi
    
    # Create export directory
    mkdir -p "$EXPORT_DIR"
    
    print_status "Copying collection files..."
    # Copy everything first, then remove excluded items
    cp -r "${SCRIPT_DIR}/"* "$EXPORT_DIR/"
    
    # Remove excluded files and directories
    for item in "${EXCLUDE_LIST[@]}"; do
        if [ -e "$EXPORT_DIR/$item" ]; then
            print_status "Removing excluded item: $item"
            rm -rf "$EXPORT_DIR/$item"
        fi
    done
    
    # Create a README file explaining what was exported
    cat > "$EXPORT_DIR/EXPORT-README.md" << EOF
# Bruno Collection Export

This folder contains an exported version of the Digital Waste Tracking External API Bruno collection.

## What's Included
- All API test requests and scenarios
- Collection configuration and documentation
- Test data and examples
- Step-by-step instructions for setup and usage

## What's NOT Included (for security reasons)
- Internal development environment files
- Internal test environment files  
- Internal performance testing environment files
- Sensitive credentials and endpoints

## Setup Instructions
1. Import this folder into Bruno
2. Configure your own environment variables
3. Set up your OAuth2 credentials
4. Configure your receiving site ID

## Important Notes
- This collection requires valid OAuth2 client credentials
- You must configure your own environment variables
- The collection includes comprehensive documentation for setup
- All test scenarios are ready to use once configured

## Support
For questions about this collection, refer to the included documentation or contact the Digital Waste Tracking team.

**Exported on**: $(date)
**Collection Version**: $(grep '"version"' "${SCRIPT_DIR}/bruno.json" | cut -d'"' -f4 2>/dev/null || echo "Unknown")
EOF
    
    print_success "Collection exported successfully to: $EXPORT_DIR"
}

# Function to create zip file
create_zip() {
    if [ "$1" = "true" ]; then
        print_status "Creating zip file..."
        
        # Remove previous zip if it exists
        if [ -f "$ZIP_FILE" ]; then
            rm -f "$ZIP_FILE"
        fi
        
        # Create zip file
        if command -v zip &> /dev/null; then
            cd "$EXPORT_DIR"
            zip -r "$ZIP_FILE" . -x "*.DS_Store" "Thumbs.db" "${COLLECTION_NAME}/*"
            cd ..
            print_success "Zip file created: $ZIP_FILE"
            
            # Remove the export directory since we have the zip file
            print_status "Removing export directory (zip file contains everything needed)..."
            rm -rf "$EXPORT_DIR"
            print_success "Export directory removed: $EXPORT_DIR"
        else
            print_warning "zip command not found. Skipping zip creation."
            print_status "You can manually zip the exported folder: $EXPORT_DIR"
        fi
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -z, --zip        Create a zip file of the exported collection"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0               # Export collection to folder only"
    echo "  $0 -z            # Export collection and create zip file"
    echo "  $0 --zip         # Export collection and create zip file"
    echo ""
    echo "Note: This script can be run from any directory and will automatically"
    echo "      find the Bruno collection files based on the script's location."
}

# Function to show excluded items
show_excluded() {
    echo ""
    print_status "The following items will be excluded from export:"
    for item in "${EXCLUDE_LIST[@]}"; do
        echo "  - $item"
    done
    echo ""
}

# Main script
main() {
    local create_zip_file=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -z|--zip)
                create_zip_file=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check if we're in the right directory
    if [ ! -f "${SCRIPT_DIR}/bruno.json" ]; then
        print_error "Bruno collection not found at: ${SCRIPT_DIR}"
        print_error "This script must be run from a directory containing a valid Bruno collection"
        exit 1
    fi
    
    # Show what will be excluded
    show_excluded
    
    # Show where we're looking for the collection
    print_status "Looking for Bruno collection in: ${SCRIPT_DIR}"
    
    # Export the collection
    export_collection
    
    # Create zip if requested
    create_zip "$create_zip_file"
    
    # Final summary
    echo ""
    print_success "Export completed successfully!"
    echo ""
    print_status "Exported collection location: $EXPORT_DIR"
    if [ "$create_zip_file" = "true" ] && [ -f "$ZIP_FILE" ]; then
        print_status "Zip file created: $ZIP_FILE"
    fi
    echo ""
    print_status "The exported collection is ready for external sharing."
    print_warning "Remember to verify that no sensitive information was included before sharing."
}

# Run main function with all arguments
main "$@"
