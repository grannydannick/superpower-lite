# Questionnaire

## Overview

This directory contains various types of questionnaire components used for collecting user input in different formats. It is based on Medplum Questionnaires which can be found here: https://www.medplum.com/products/questionnaires

**Important note here:** We aim to show one question on a page, but map nested items. Our questionnaires often consist of groups, so we want to have a clear hierarchy towards the user. The responses are stored in a custom store with `zustand` and only sent to server on click to next button. If there is debugging needed you most likely want to look into passed `onSave` and `onSubmit` functions.

## Questionnaire Specific Components

### QuestionnaireForm (`questionnaire-form.tsx`)

- Main container component that manages the overall questionnaire
- Handles state management through QuestionnaireStoreProvider
- Orchestrates saving/submitting questionnaire responses
- Supports showing/hiding intro pages

### QuestionnairePageSequence (`questionnaire-page-sequence.tsx`)

- Controls the sequence and flow between questionnaire pages
- Handles navigation between questions
- Manages progress tracking and animations between pages
- Provides visual feedback on completion progress

### QuestionnaireQuestion (`questionnaire-question.tsx`)

- Renders individual question pages
- Handles validation of required fields
- Manages navigation (next/previous) buttons
- Supports different question types including groups and display text

### QuestionnaireItem (`questionnaire-item.tsx`)

- Core component for rendering different input types based on QuestionnaireItem.type
- Supports multiple input types: boolean, decimal, integer, date, string, text, etc.
- Handles data binding between UI inputs and FHIR questionnaire response format
- Connects to the appropriate specialized input component based on item type

### QuestionnaireRepeatableItem (`questionnaire-repeatable-item.tsx`)

- Handles repeatable items/questions (multiple instances of the same question)
- Manages adding/removing repeated items
- Supports both nested and top-level repeatable items
- Provides appropriate layout for each repeated instance

### QuestionnaireErrorWrapper (`questionnaire-error-wrapper.tsx`)

- Simple wrapper component for error handling
- Displays error messages for validation failures
- Maintains consistent error styling across all question types

## Available Types

### Radio Buttons (`radio-buttons.tsx`)

- Single-select option list displayed as a vertical stack of radio buttons
- Supports keyboard navigation (number keys 1-9 for quick selection)
- Selection does not auto-advance; use the Next button
- Optimized for accessibility with keyboard navigation and focus states

### Multiple Choice (`multiple-choice.tsx`)

- Checkbox-based selection for both single and multiple answers
- Uses animated checkboxes for visual feedback
- Auto-advances when selecting a single item (if not repeatable)
- Supports responsive grid layout for longer option lists

### Rating Scale (`rating-scale.tsx`)

- Horizontal scale typically used for ratings (e.g., 1-5, "Very poor" to "Excellent")
- Visually optimized for rating questions
- Maintains consistent spacing between options
- Includes descriptive labels at scale endpoints

### Multi-Select (`multi-select.tsx`)

- Two main components:
  - `QuestionnaireChoiceDropDownInput`: Dropdown-based selection for both single and multiple options
  - `QuestionnaireChoiceSetInput`: Alternative radio button display for single selections
- Supports various data types including CodeableConcept and Coding
- Single-select variants do not auto-advance; use the Next button
