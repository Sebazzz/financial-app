// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TemplateTests.cs
//  Project         : App.Tests
// ******************************************************************************

namespace App.Tests.Mailing {
    using System;
    using NUnit.Framework;
    using Support.Mailing;
    using TestSupport;

    [TestFixture]
    public sealed class TemplateTests {
        [Test]
        public void Template_InputEmptyString_OutputsEmptyString() {
            // Given
            var template = new Template(String.Empty);

            // When
            StringifiedTemplate output = template.Stringify();

            // Then
            Assert.That(output.Title, Is.Empty);
            Assert.That(output.Body, Is.Empty);
        }

        [Test]
        public void Template_InputHtml_ExtractsTitle() {
            // Given
            var template = new Template("<html><head><title>Derp</title></head><body>Bla bla</body></html>");

            // When
            StringifiedTemplate output = template.Stringify();

            // Then
            Assert.That(output.Title, Is.EqualTo("Derp"));
            Assert.That(output.Body, Is.EqualTo("<html><head><title>Derp</title></head><body>Bla bla</body></html>"));
        }

        [Test]
        public void Template_InputHtml_ExtractsTitleTrimmed() {
            // Given
            var template = new Template("<html><head><title>    Collapse Outer Whitespace title </title></head><body>Bla bla</body></html>");

            // When
            StringifiedTemplate output = template.Stringify();

            // Then
            Assert.That(output.Title, Is.EqualTo("Collapse Outer Whitespace title"));
            Assert.That(output.Body, Is.EqualTo("<html><head><title>    Collapse Outer Whitespace title </title></head><body>Bla bla</body></html>"));
        }

        [Test]
        public void Template_InputHtml_ReplacesTokens() {
            // Given
            var template = new Template("<html><head><title>Hello {subject}</title></head><body>Hi {subject}!</body></html>");

            // When
            template.AddReplacement("subject", "World");
            StringifiedTemplate output = template.Stringify();

            // Then
            Assert.That(output.Title, Is.EqualTo("Hello World"));
            Assert.That(output.Body, Is.EqualTo("<html><head><title>Hello World</title></head><body>Hi World!</body></html>"));
        }

        [Test]
        public void Template_InputHtml_HideSection_RemovesFromHtml() {
            // Given
            var template = new Template(FileOpener.GetMailExample("Input"));

            // When
            template.AddReplacement("subject", "World");
            template.RemoveSection("MY-HIDE-SECTION");
            StringifiedTemplate output = template.Stringify();

            // Then
            Assert.That(output.Title, Is.EqualTo("Hello World"));
            Assert.That(output.Body, Is.EqualTo(FileOpener.GetMailExample("Expected")));
        }

        [Test]
        public void Template_InputHtml_RepeatSection_DuplicatesInHtml() {
            // Given
            var template = new Template(FileOpener.GetMailExample("Input"));
            (string name, int age)[] dataList = {
                ("John Doe", 32),
                ("Jane Doe", 26)
            };

            // When
            template.RepeatSection(
                "MY-REPEAT-SECTION",
                dataList,
                (item, subTemplate) => subTemplate.Replace("name", item.name).Replace("age", item.age.ToString())
            );
            StringifiedTemplate output = template.Stringify();

            // Then
            Assert.That(output.Body, Is.EqualTo(FileOpener.GetMailExample("Expected")));
        }
    }
}