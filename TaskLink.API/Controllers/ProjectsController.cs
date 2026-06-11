using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskLink.Infrastructure.Data;
using TaskLink.Infrastructure.Entities;

namespace TaskLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. READ ALL (Menggunakan Raw SQL Query sesuai kriteria)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            var query = "SELECT * FROM \"Projects\"";
            var projects = await _context.Projects.FromSqlRaw(query).ToListAsync();
            return Ok(projects);
        }

        // 2. READ BY ID (Menggunakan Raw SQL Query sesuai kriteria)
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var query = "SELECT * FROM \"Projects\" WHERE \"Id\" = {0}";
            var project = await _context.Projects.FromSqlRaw(query, id).FirstOrDefaultAsync();

            if (project == null)
            {
                return NotFound(new { message = $"Project dengan ID {id} tidak ditemukan." });
            }

            return Ok(project);
        }

        // 3. CREATE (Menggunakan EF Core)
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(Project project)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        // 4. UPDATE (Menggunakan EF Core)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest(new { message = "ID di URL tidak cocok dengan ID di data." });
            }

            _context.Entry(project).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Projects.AnyAsync(e => e.Id == id))
                {
                    return NotFound(new { message = "Project tidak ditemukan." });
                }
                throw;
            }

            return NoContent();
        }

        // 5. DELETE (Menggunakan EF Core)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound(new { message = "Project tidak ditemukan." });
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project berhasil dihapus." });
        }
    }
}