using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagementApi.Data;
using TaskManagementApi.DTOs;
using TaskManagementApi.Models;

namespace TaskManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        private bool IsAdmin()
        {
            return User.IsInRole(UserRole.Admin.ToString());
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            if (IsAdmin())
            {
                var allTasks = await _context.Tasks
                    .Include(t => t.User)
                    .Select(t => new
                    {
                        t.Id,
                        t.Title,
                        t.Description,
                        t.IsCompleted,
                        t.CreatedAt,
                        t.UserId,
                        UserEmail = t.User!.Email
                    })
                    .ToListAsync();

                return Ok(allTasks);
            }

            var userId = GetCurrentUserId();

            var tasks = await _context.Tasks
                .Where(t => t.UserId == userId)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.IsCompleted,
                    t.CreatedAt
                })
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound();

            if (!IsAdmin() && task.UserId != GetCurrentUserId())
                return Forbid();

            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask(CreateTaskDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                UserId = GetCurrentUserId()
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound();

            if (!IsAdmin() && task.UserId != GetCurrentUserId())
                return Forbid();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound();

            if (!IsAdmin() && task.UserId != GetCurrentUserId())
                return Forbid();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task deleted successfully." });
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllTasksForAdmin()
        {
            var tasks = await _context.Tasks
                .Include(t => t.User)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.IsCompleted,
                    t.CreatedAt,
                    Owner = t.User!.Email
                })
                .ToListAsync();

            return Ok(tasks);
        }
    }
}