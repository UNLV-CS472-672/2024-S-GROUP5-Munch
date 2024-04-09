import unittest
import os
import coverage


def run_tests():
    # Start code coverage measurement
    cov = coverage.Coverage(
        source=[
            "user_routes",
            "post_routes",
            "feed_routes",
            "recipe_routes",
            "like_routes",
            "bookmark_routes",
        ]
    )
    cov.start()

    # Discover and run all test files in the "unit_tests" directory
    test_loader = unittest.TestLoader()
    test_dir = os.path.join(os.path.dirname(__file__), "unit_tests")
    test_suite = test_loader.discover(start_dir=test_dir, pattern="test_*.py")
    test_runner = unittest.TextTestRunner()
    result = test_runner.run(test_suite)

    # Stop code coverage measurement
    cov.stop()

    cov.report(show_missing=True)

    # Return the overall test result
    return result


if __name__ == "__main__":
    # Run the tests
    test_result = run_tests()

    # Exit with status code 1 if any test failed, otherwise exit with status code 0
    exit_code = 1 if test_result.errors or test_result.failures else 0
    exit(exit_code)
