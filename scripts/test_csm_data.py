"""Unit tests for the shared helpers. Fast: they do not read the CSV snapshots.

Run from the project root:
    python -m unittest discover -s scripts
"""
import re
import unittest

from csm_data import SOURCES, clean, normalize_region, region_sort_key, roman_to_int, snapshot_date, source_path


class NormalizeRegionTest(unittest.TestCase):
    def test_uppercase_region_joins_the_mixed_case_one(self):
        self.assertEqual(normalize_region("REGION V"), "Region V")
        self.assertEqual(normalize_region("Region V"), "Region V")

    def test_suffix_and_spacing_are_kept_tidy(self):
        self.assertEqual(normalize_region("  region iv-a "), "Region IV-A")

    def test_named_regions_are_left_alone(self):
        for name in ("NCR", "CAR", "CARAGA", "MIMAROPA", "NIR"):
            self.assertEqual(normalize_region(name), name)

    def test_blank_is_kept_as_unknown_rather_than_dropped(self):
        self.assertEqual(normalize_region(""), "Unknown")
        self.assertEqual(normalize_region(None), "Unknown")


class CleanTest(unittest.TestCase):
    def test_trims_and_collapses_spaces(self):
        self.assertEqual(clean("  San  Carlos   City "), "San Carlos City")
        self.assertEqual(clean(None), "")


class RegionOrderTest(unittest.TestCase):
    def test_roman_numerals(self):
        expected = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12}
        for numeral, value in expected.items():
            self.assertEqual(roman_to_int(numeral), value)

    def test_numbered_regions_sort_by_number_not_by_spelling(self):
        names = ["Region IX", "Region V", "NCR", "Region IV-A", "CAR", "Region X", "Region I"]
        self.assertEqual(
            sorted(names, key=region_sort_key),
            ["CAR", "NCR", "Region I", "Region IV-A", "Region V", "Region IX", "Region X"],
        )


class SourcesTest(unittest.TestCase):
    def test_snapshot_date_comes_from_the_file_names(self):
        self.assertRegex(snapshot_date(), r"^\d{4}-\d{2}-\d{2}$")
        self.assertIn(snapshot_date().replace("-", ""), "".join(SOURCES.values()))

    def test_every_source_file_is_in_the_data_folder(self):
        for name in SOURCES:
            self.assertTrue(source_path(name).exists(), f"missing {source_path(name)}")
            self.assertTrue(re.search(r"\d{12}\.csv$", SOURCES[name]), "file name should end in YYYYMMDDHHMM.csv")


if __name__ == "__main__":
    unittest.main()
