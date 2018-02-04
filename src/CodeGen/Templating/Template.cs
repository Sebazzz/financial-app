namespace CodeGen.Templating {
    using System;
    using System.Threading.Tasks;
    using Runtime;

    public sealed class Template {
        private readonly TemplateView _instance;

        public Template(TemplateView instance) {
            this._instance = instance;
        }

        public void SetModel<TModel>(TModel model) {
            if (this._instance is TemplateView<TModel> templateView) templateView.Model = model;
            else
                throw new InvalidOperationException(
                    $"Attempting to assign model {typeof(TModel)} to template of type {this._instance.GetType()}");
        }

        public async Task<string> ExecuteAsync() {
            await this._instance.ExecuteAsync();

            return this._instance.GetBuffer();
        }
    }
}