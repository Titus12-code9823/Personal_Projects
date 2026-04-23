using TaskManagementApi.Models;

namespace TaskManagementApi.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}