// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Base64UrlConverter.cs
//  Project         : App
// ******************************************************************************

namespace App.Support {
    using System;
    using Microsoft.AspNetCore.Authentication;
    using Newtonsoft.Json;

    public class Base64UrlConverter : JsonConverter<byte[]> {
        private readonly Required _requirement = Required.DisallowNull;


        public Base64UrlConverter() { }

        public Base64UrlConverter(Required required) {
            this._requirement = required;
        }


        public override void WriteJson(JsonWriter writer, byte[] value, JsonSerializer serializer) {
            writer.WriteValue(Base64UrlTextEncoder.Encode(value));
        }


        public override byte[] ReadJson(JsonReader reader, Type objectType, byte[] existingValue, bool hasExistingValue,
            JsonSerializer serializer) {
            byte[] ret; 
            if (null == reader.Value && this._requirement == Required.AllowNull) return null;


            if (null == reader.Value) throw new InvalidOperationException("json value must not be null");

            if (typeof(string) != reader.ValueType)
                throw new InvalidOperationException("json valuetype must be string");

            try {
                ret = Base64UrlTextEncoder.Decode((string) reader.Value);
            }
            catch (FormatException) {
                throw new InvalidOperationException("json value must be valid base64 encoded string");
            }

            return ret;
        }
    }
}