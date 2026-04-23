namespace TaskManagementApi.DTOs
{
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // opțional pentru testare; în practică poți scoate asta
        public string Role { get; set; } = "User";
    }
}