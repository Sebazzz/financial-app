namespace CodeGen.Templating {
    using System;

    [AttributeUsage(AttributeTargets.Assembly)]
    public sealed class TemplateViewAttribute : Attribute {
        public Type ViewType { get; }

        public TemplateViewAttribute(Type viewType) {
            this.ViewType = viewType;
        }
    }
}