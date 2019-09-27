import unittest

import PaloAltoEngine


class TestClass(unittest.TestCase):
    def test_instantiation_str(self):
        self.assertRaises(TypeError, PaloAltoEngine.PaloAltoEngine("path"))

    def test_instantiation_others(self):
        self.assertRaises(TypeError, PaloAltoEngine.PaloAltoEngine(1))


unittest.main()
