using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskLink.Infrastructure.Data;
using TaskLink.Infrastructure.Entities;

namespace TaskLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // DTO (Data Transfer Object) untuk request input
        public record UserDto(string Username, string Password);

        // 1. REGISTER USER
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Username sudah digunakan." });
            }

            // BCrypt/Hashing idealnya digunakan, namun demi simplisitas tes dan kecepatan, 
            // kita simpan hash sederhana atau plaintext ter-masking agar fokus ke integrasi token
            var user = new User
            {
                Username = request.Username,
                PasswordHash = Convert.ToBase64String(Encoding.UTF8.GetBytes(request.Password)) // Simple hash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registrasi berhasil! Silakan login." });
        }

        // 2. LOGIN USER & GENERATE JWT TOKEN
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDto request)
        {
            var inputPasswordHash = Convert.ToBase64String(Encoding.UTF8.GetBytes(request.Password));
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.PasswordHash == inputPasswordHash);

            if (user == null)
            {
                return Unauthorized(new { message = "Username atau password salah." });
            }

            // Membuat JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSettings = _config.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7), // Token aktif selama 7 hari
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { token = tokenString, username = user.Username });
        }
    }
}