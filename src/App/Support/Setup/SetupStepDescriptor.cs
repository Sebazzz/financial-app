// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupStepDescriptor.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup {
    public class SetupStepDescriptor {
        public int Order { get; set; }
        public string Name { get; set; }
        public bool IsDone { get; set; }
    }
}