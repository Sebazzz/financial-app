namespace CodeGen.Templating.Runtime {
    using System;
    using System.Globalization;
    using System.IO;
    using System.Text;
    using System.Threading.Tasks;

    public abstract class TemplateView {
        private readonly StringBuilder _buffer;

        protected TemplateView() {
            this._buffer = new StringBuilder();

            this.Output = new StringWriter(this._buffer);
        }

        public TextWriter Output { get; }

        public abstract Task ExecuteAsync();

        public string GetBuffer() => this._buffer.ToString();


        public void WriteLiteral(string input) => this.Output.Write(input);
        public void Write(string input) => this.Output.Write(input);
        public void Write(IFormattable input) => this.Output.Write(input?.ToString(null, CultureInfo.InvariantCulture));
        public void Write(object input) => this.Output.Write(input);
    }

    public abstract class TemplateView<TModel> : TemplateView {
        
        public TModel Model { get; set; }
    }
}