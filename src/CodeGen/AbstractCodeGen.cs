namespace CodeGen {
    using System.Threading.Tasks;

    internal abstract class AbstractCodeGen {
        public abstract Task Execute(CodeGenContext context);
    }
}