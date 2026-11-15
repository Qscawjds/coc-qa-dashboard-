import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from ftet import (course_ftet, load_summary, load_courses, load_program_totals,
                  available_terms, teacher_totals, validate_courses)
from ftet import charts


class TestCalc(unittest.TestCase):
    def test_values_from_workbook(self):
        self.assertAlmostEqual(course_ftet(3, 0, 0, 1, 15), 0.1714285714, 8)   # 968-350
        self.assertAlmostEqual(course_ftet(2, 2, 0, 1, 15), 0.2, 8)           # lecture+lab
        self.assertAlmostEqual(course_ftet(0, 2, 0, 1, 15), 0.0857142857, 8)  # lab only
        self.assertAlmostEqual(course_ftet(0, 0, 1, 1, 15), 0.0285714286, 8)  # 1 project
        self.assertAlmostEqual(course_ftet(2, 0, 0, 1, 8), 0.0609523810, 8)   # 8-week course
        self.assertEqual(course_ftet(None, "เรียนร่วมกับ", None, 1, 15), 0.0)  # shared class


class TestData(unittest.TestCase):
    def test_summary(self):
        s = load_summary()
        v = s[(s.program == "Comp") & (s.year == 2562) & (s.term == "AVG")].ftet.iat[0]
        self.assertAlmostEqual(v, 0.49)
        self.assertEqual(set(s.program), {"Comp", "DE", "DBiz", "AISE", "MsComp", "CoC"})
        # AVG == mean of the two terms for every programme/year that has both
        for (p, y), g in s[s.term != "AVG"].groupby(["program", "year"]):
            avg = s[(s.program == p) & (s.year == y) & (s.term == "AVG")].ftet.iat[0]
            self.assertAlmostEqual(g.ftet.mean(), avg, places=6, msg=f"{p} {y}")

    def test_course_sheets(self):
        terms = available_terms()
        self.assertIn((2567, 1), terms)
        d = load_courses(None, 2567, 1)
        t = teacher_totals(d)
        self.assertEqual(len(t), 36)
        # recomputed mean is close to the workbook's own college average (0.4516)
        self.assertAlmostEqual(t.ftet.mean(), 0.4516, delta=0.01)
        self.assertLessEqual(len(validate_courses(d)), 3)  # known sheet inconsistencies

    def test_summary_vs_program_sheets(self):
        s = load_summary()
        for term in (1, 2):
            for _, r in load_program_totals(None, 2567, term).iterrows():
                v = s[(s.program == r.program) & (s.year == 2567) & (s.term == str(term))].ftet.iat[0]
                self.assertAlmostEqual(r.sheet_total, v, delta=0.006, msg=f"{r.program} {term}")


class TestCharts(unittest.TestCase):
    def test_all_figures_render(self):
        s = load_summary()
        c = load_courses(None, 2567, 1)
        from ftet.calc import add_calc_column
        c = add_calc_column(c)
        t = teacher_totals(c)
        for f in (charts.fig_year_lines(s), charts.fig_year_bars(s), charts.fig_term_lines(s),
                  charts.fig_heatmap(s), charts.fig_teacher_bars(t), charts.fig_teacher_box(t),
                  charts.fig_teacher_courses(c, int(t.teacher_id.iat[0]))):
            self.assertTrue(len(f.axes) >= 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
