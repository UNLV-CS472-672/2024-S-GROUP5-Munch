#!/bin/bash

# Path to the Firestore export file
EXPORT_FILE="./firestore-export"

# Start Firestore emulator with import
firebase emulators:start --import=$EXPORT_FILE
