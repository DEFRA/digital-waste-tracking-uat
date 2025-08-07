@DWT-387 @regression-tests
Feature: Waste Weight Estimate Validation for Waste Movement Receipt Submissions
  As a waste receiver
  I should only be able to submit waste movement receipts with valid weight estimate indicators
  So that the quantity accuracy is properly documented

  Background:
    Given I have a complete waste movement receipt with valid base data
    And I have a valid authentication header

  Scenario Outline: Successfully Submit a Waste Movement Receipt with Valid Weight Estimate Indicator
    Given the waste item container weight indicates it is <estimate_status>
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

    Examples:
      | estimate_status |
      | an estimate     |
      | not an estimate |

  Scenario: Attempting to Submit a Waste Movement Receipt with Missing Weight Estimate Indicator
    Given the waste item has no weight estimate indicator
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that a weight estimate indicator is required

  Scenario: Attempting to Submit a Waste Movement Receipt with Invalid Weight Estimate Indicator
    Given the waste item has an invalid weight estimate indicator
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the weight estimate indicator must be true or false
