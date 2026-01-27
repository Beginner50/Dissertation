using System.Text.Json;
using Google.GenAI;
using Google.GenAI.Types;
using PMS.DTOs;
using PMS.Models;
using Type = Google.GenAI.Types.Type;

namespace PMS.Services;

public class AIService
{
    protected readonly Client client;
    protected readonly ILogger<AIService> logger;

    public AIService(Client client, ILogger<AIService> logger)
    {
        this.client = client;
        this.logger = logger;
    }

    public async Task<List<UpdateFeedbackCriterionDTO>> EvaluateFeedbackCriteria(
       ProjectTask task,
       byte[] previousDeliverable,
       byte[] newDeliverable,
       List<FeedbackCriterion> previousCriteria
   )
    {
        var feedbackCriteriaListSchema = new Schema
        {
            Type = Type.ARRAY,
            Items = new Schema
            {
                Type = Type.OBJECT,
                Properties = new Dictionary<string, Schema> {
                {"FeedbackCriteriaID", new Schema{Type=Type.NUMBER}},
                {"Status", new Schema{Type=Type.STRING, Enum=new List<string>{"met", "unmet"}}},
                {"ChangeObserved", new Schema
                {
                    Type=Type.STRING,
                    Description="What specific change was made between documents?"
                }},
            },
                Required = new List<string>(["FeedbackCriteriaID", "Status", "ChangeObserved"])
            }
        };

        var userContent = new Content
        {
            Role = "user",
            Parts = new List<Part>
        {
            new Part { Text = $"""
                TASK CONTEXT: {task.Title} - {task.Description}
                
                OBJECTIVE:
                Compare the 'New Deliverable' against the 'Previous Deliverable'. 
                Determine if the following 'unmet' criteria have been addressed.
                
                CRITERIA:
                {string.Join("\n", previousCriteria
                       .Select(c => $"ID:{c.FeedbackCriterionID} | Requirement: {c.Description}"))}

                INSTRUCTIONS:
                1. Identify changes between the previous and new version.
                2. If the change satisfies the requirement, set Status to 'met'.
                3. Describe the what was added/removed in 'ChangeObserved'.
                """
            },
            new Part { InlineData = new Blob
                { MimeType = "application/pdf", Data = previousDeliverable } },
            new Part { InlineData = new Blob
                { MimeType = "application/pdf", Data = newDeliverable } }
        }
        };

        var response = await client.Models.GenerateContentAsync(
            model: "gemini-2.5-flash",
            contents: new List<Content> { userContent },
            config: new GenerateContentConfig
            {
                ResponseMimeType = "application/json",
                ResponseJsonSchema = feedbackCriteriaListSchema,
                Temperature = 0.1f
            }
        );

        var jsonText = response?.Candidates?[0]?.Content?.Parts?[0].Text ?? "[]";
        var newCriteria = JsonSerializer.Deserialize<List<UpdateFeedbackCriterionDTO>>(jsonText)
                    ?? new List<UpdateFeedbackCriterionDTO>();

        if (newCriteria.Count != previousCriteria.Count)
        {
            logger.LogWarning("AI returned {NewCount} criteria, expected {ExpectedCount}",
                newCriteria.Count, previousCriteria.Count);
            throw new Exception("AI evaluation returned unexpected number of criteria");
        }

        return newCriteria;
    }
}