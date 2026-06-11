using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskLink.Infrastructure.Data;
using TaskLink.Infrastructure.Entities;

namespace TaskLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. READ ALL TASKS (Menggunakan Raw SQL Query sesuai kriteria)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            var query = "SELECT * FROM \"Tasks\"";
            var tasks = await _context.Tasks.FromSqlRaw(query).ToListAsync();
            return Ok(tasks);
        }

        // 2. READ TASK BY ID (Menggunakan Raw SQL Query sesuai kriteria)
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            var query = "SELECT * FROM \"Tasks\" WHERE \"Id\" = {0}";
            var task = await _context.Tasks.FromSqlRaw(query, id).FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound(new { message = $"Task dengan ID {id} tidak ditemukan." });
            }

            return Ok(task);
        }

        // 3. READ TASKS BY PROJECT ID (Bonus: Menampilkan daftar task berdasarkan Project tertentu via Raw SQL)
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasksByProject(int projectId)
        {
            var query = "SELECT * FROM \"Tasks\" WHERE \"ProjectId\" = {0}";
            var tasks = await _context.Tasks.FromSqlRaw(query, projectId).ToListAsync();
            return Ok(tasks);
        }

        // 4. CREATE TASK (Menggunakan EF Core + Validasi Relasi ProjectId)
        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validasi: Pastikan ProjectId yang dimasukkan benar-benar ada di database
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == task.ProjectId);
            if (!projectExists)
            {
                return BadRequest(new { message = $"Gagal membuat Task. Project dengan ID {task.ProjectId} tidak ditemukan." });
            }

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, TaskItem task)
        {
            if (id != task.Id)
            {
                return BadRequest(new { message = "ID di URL tidak cocok dengan ID di data." });
            }

            var projectExists = await _context.Projects.AnyAsync(p => p.Id == task.ProjectId);
            if (!projectExists)
            {
                return BadRequest(new { message = $"Gagal update Task. Project dengan ID {task.ProjectId} tidak ditemukan." });
            }

            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Tasks.AnyAsync(e => e.Id == id))
                {
                    return NotFound(new { message = "Task tidak ditemukan." });
                }
                throw;
            }

            return NoContent();
        }

        // 6. DELETE TASK (Menggunakan EF Core)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound(new { message = "Task tidak ditemukan." });
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task berhasil dihapus." });
        }
    }
}