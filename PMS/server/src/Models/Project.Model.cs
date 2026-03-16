using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

/*
    Disclaimer:
    From the UML schema, supervisors have a many-to-many relationship with projects.

    I have considered two approaches of addressing this:
        1) Creating a dedicated SupervisionGroup table for co-supervision.
        2) Leveraging EF Core's support for many-to-many relationships with a shadow table
           to manage the relationship between supervisors and projects.

    Their pros and cons are as follows:
        1) Dedicated SupervisionGroup Table
            Pros:
                - Allows for additional attributes related to the supervision relationship
                  (e.g., role of supervisor, start date, etc.)
            Cons:
                - Adds complexity to the database schema with an additional table.
                - Requires more complex queries to retrieve supervisors for a project or projects
                  for a supervisor.

        2) Shadow Table with EF Core
            Pros:
                - Simpler database schema without an additional table.
                - EF Core handles the many-to-many relationship, simplifying queries for
                  supervisors and projects.
            Cons:
                - Less explicit modeling of the supervision relationship, which may lead to
                  confusion when querying or managing supervisors and projects.
                - Limited ability to add attributes related to the supervision relationship.
    
    I have chosen the second approach for its simplicity and because the UML schema 
    does not indicate any additional attributes for the supervision relationship. Furthermore,
    considering the fact that most supervision relationships are likely to be one-to-one, 
    the added complexity of a dedicated SupervisionGroup table may not be justified.
*/
public class Project
{
    public long ProjectID { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required bool IsArchived { get; set; }

    public required long StudentID { get; set; }
    [ForeignKey("StudentID")]
    public User? Student { get; set; }
    public required long SupervisorID { get; set; }
    [ForeignKey("SupervisorID")]
    public User? Supervisor { get; set; }

    /*
        The InverseProperty is explictly used to connect a Navigation property to its
        inverse in another entity referencing User.

        A Navigation Property does not actually exist in the database table
    */
    [InverseProperty("Project")]
    public List<ProjectTask> Tasks { get; set; } = [];
}