namespace CodeGen {
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Text;

    internal static class ConsoleWriter {
        public static void Info(string message) => WriteLineInternal(message, ConsoleColor.Cyan);
        public static void Success(string message) => WriteLineInternal(message, ConsoleColor.Green);
        public static void Warning(string message) => WriteLineInternal(message, ConsoleColor.Yellow);
        public static void Error(string message) => WriteLineInternal(message, ConsoleColor.Red);

        [Conditional("DEBUG")]
        public static void Verbose(string message) => WriteLineInternal(message, ConsoleColor.Gray);

        public static void Clear() {
            Console.BackgroundColor = ConsoleColor.Black;
            Console.ForegroundColor = ConsoleColor.White;

            Console.Clear();
        }

        public static TextWriter VerboseWriter() => new VerboseWrapperWriter();

        private sealed class VerboseWrapperWriter : TextWriter {
            public override Encoding Encoding => Encoding.Default;

            public override void Write(char value) {
                Verbose(value.ToString());
            }

            public override void Write(string value) {
                Verbose(value);
            }
        }

        private static void WriteLineInternal(string message, ConsoleColor color) {
            using (new ColorScope(color)) {
                Console.WriteLine(message);
            }
        }

        private struct ColorScope : IDisposable {
            private readonly ConsoleColor _originalColor;

            public ColorScope(ConsoleColor newColor) {
                this._originalColor = Console.ForegroundColor;

                Console.ForegroundColor = newColor;
            }

            public void Dispose() {
                Console.ForegroundColor = this._originalColor;
            }
        }
        
    }
}