import unittest
import os
from io import StringIO
import coverage

def run_tests():
    # Define the patterns for exclusion
    exclude_patterns = ["__init__.py"]

    # Start code coverage measurement
    cov = coverage.Coverage(source=[os.path.join(os.path.dirname(__file__), "routes")], omit=exclude_patterns)
    cov.start()

    # Discover and run all test files in the "unit_tests" directory
    test_loader = unittest.TestLoader()
    test_dir = os.path.join(os.path.dirname(__file__), "unit_tests")
    test_suite = test_loader.discover(start_dir=test_dir, pattern="test_*.py")
    test_runner = unittest.TextTestRunner()
    result = test_runner.run(test_suite)

    # Stop code coverage measurement
    cov.stop()

    report_output = StringIO()
    cov.report(file=report_output, show_missing=True)
    report_output.seek(0)  # Reset the stream position to the beginning

    # Modify the report output to remove "routes\" prefix and ".py" postfix
    modified_report = ""
    for line in report_output:
        modified_line = line.replace("routes\\", "").replace(".py", "{:>10}".format(""))
        modified_report += modified_line

    # Print or save the modified report
    print(modified_report)

    # Return the overall test result
    return result


if __name__ == "__main__":
    # Run the tests
    test_result = run_tests()

    # Exit with status code 1 if any test failed, otherwise exit with status code 0
    exit_code = 1 if test_result.errors or test_result.failures else 0
    exit(exit_code)
