namespace App {
    using Models.Domain;

    public static class AutoMapperConfig {

        public static void Configure() {
            AutoMapper.Mapper.CreateMap<Category,Category>()
                             .ForMember(x=>x.Owner, m=>m.Ignore());
        }
    }
}