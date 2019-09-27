// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : StringBuilderExtensionsTests.cs
//  Project         : App.Tests
// ******************************************************************************

namespace App.Tests {
    using System;
    using System.Text;
    using NUnit.Framework;
    using Support;

    [TestFixture]
    public sealed class StringBuilderExtensionsTests {
        [TestCase("abcdef", "c", 0)]
        [TestCase("abcdef", "cdef", 0)]
        [TestCase("abcdef", "cdefh", 0)]
        [TestCase("abcdef", "a", 0)]
        [TestCase("abcabc", "abc", 0)]
        [TestCase("abcabc", "abc", 1)]
        [TestCase("cbacba", "abc", 1)]
        [TestCase("cbacba", "", 0)]
        [TestCase("", "", 0)]
        public void IndexOf_ReturnsCorrectIndex(string haystack, string needle, int offset) {
            // Given
            var stringBuilder = new StringBuilder(haystack);
            int expectedIndex = haystack.IndexOf(needle, offset, StringComparison.OrdinalIgnoreCase);

            // When
            int actualIndex = stringBuilder.IndexOf(needle, offset);

            // Then
            Assert.That(actualIndex, Is.EqualTo(expectedIndex), 
                        $"Expected to find '{needle}' in string '{haystack}' at position {expectedIndex} (searching from position {offset}), but returned {actualIndex}");
        }
    }
}