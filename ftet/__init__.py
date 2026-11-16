"""CoC FTET toolkit: load FTET workbook, calculate, and visualise."""
from .loader import (load_summary, load_courses, available_terms, DEFAULT_XLSX,
                     load_program_totals)
from .calc import course_ftet, teacher_totals, program_stats, validate_courses
from . import charts
from . import charts_hightech
from . import charts_apple

__all__ = ["load_summary", "load_courses", "available_terms", "DEFAULT_XLSX",
           "load_program_totals", "course_ftet", "teacher_totals",
           "program_stats", "validate_courses", "charts", "charts_hightech", "charts_apple"]
