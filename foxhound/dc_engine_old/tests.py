import unittest

from . import PaloAltoEngine


class TestClass(unittest.TestCase):
    def test_instantiation_str(self):
        self.assertRaises(TypeError, PaloAltoEngine.PaloAltoEngine(
            "input_path", "output_path"))

    def test_instantiation_others(self):
        self.assertRaises(TypeError, PaloAltoEngine.PaloAltoEngine(1, 2))


unittest.main()
