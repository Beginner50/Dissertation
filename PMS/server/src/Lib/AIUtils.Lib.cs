using System.Text.Json;
using Google.GenAI;
using Google.GenAI.Types;
using PMS.DTOs;
using PMS.Models;
using Type = Google.GenAI.Types.Type;

namespace PMS.Lib;

public class PageRange
{
    public int StartPage { get; set; }
    public int EndPage { get; set; }
}

// More information on: https://googleapis.github.io/dotnet-genai/#full-api-reference
public class AIUtils
{
    public static async Task<IEnumerable<PageRange>> LocatePagesFromCriteria(
        Client client,
        List<FeedbackCriteria> feedbackCriterias,
        string tableOfContents,
        GetProjectTaskDTO task,
        ILogger? logger = null
    )
    {
        var pageRangeSchema = new Schema
        {
            Type = Type.OBJECT,
            Properties = new Dictionary<string, Schema>
            {
                {"StartPage", new Schema{Type=Type.INTEGER, Title="Start Page"}},
                {"EndPage", new Schema{Type=Type.INTEGER, Title="End Page"}}
            },
            Required = new List<string> { "StartPage", "EndPage" }
        };

        var pageRangeListSchema = new Schema
        {
            Type = Type.ARRAY,
            Items = pageRangeSchema,
            Title = "Page Ranges"
        };

        var prompt = $$"""
        {{task.Title}}
        {{task.Description}}

        Analyze this Table of Contents and the feedback criteria below. 
        Identify the specific page ranges based on the information below.
        If you cannot find specific content, search for the most similar
        content for a feedback criteria. Otherwise, if there is no specific
        content, then select all pages
    
        TOC: {{tableOfContents}}
        Criteria: {{string.Join("; ", feedbackCriterias
            .Where(c => c.Status == "unmet")
            .Select(c =>
            $"\n{c.FeedbackCriteriaID}: {c.Description}"
            ))}}
        
        Example Output:
            [{StartPage: 1, EndPage: 4}, {StartPage: 8, EndPage: 8}]
        """;

        logger?.LogDebug("{prompt}", prompt);

        var response = await client.Models.GenerateContentAsync(
            model: "gemini-2.5-flash", contents: prompt,
            config: new GenerateContentConfig
            {
                ResponseMimeType = "application/json",
                ResponseSchema = pageRangeListSchema
            }
        );
        logger?.LogDebug(JsonSerializer.Serialize(response));

        var jsonText = response.Candidates[0].Content.Parts[0].Text;

        try
        {
            logger?.LogDebug("{jsonText}", jsonText);
            return JsonSerializer.Deserialize<List<PageRange>>(jsonText);
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static async Task<IEnumerable<FeedbackDTO>> EvaluateCriteria(
        Client client,
        byte[] pdfDocument,
        List<FeedbackCriteria> feedbackCriterias,
        GetProjectTaskDTO task,
        ILogger? logger
    )
    {
        var feedbackCriteriaSchema = new Schema
        {
            Type = Type.OBJECT,
            Properties = new Dictionary<string, Schema>
            {
                {"FeedbackCriteriaID", new Schema{Type=Type.NUMBER, Title="Feedback Criteria ID"}},
                {"Description", new Schema{Type=Type.STRING, Title="Description"}},
                {"Status", new Schema{Type=Type.STRING, Title="Status", Enum=new List<string>{"met", "unmet"}}},
            },
            Required = new List<string>(["FeedbackCriteriaID", "Description", "Status"])
        };

        var feedbackCriteriaListSchema = new Schema
        {
            Type = Type.ARRAY,
            Items = feedbackCriteriaSchema,
            Title = "Feedback Criteria List"
        };

        var prompt = $$"""
        {{task.Title}}
        {{task.Description}}

        Review the compliance of the document against the feedback criteria listed:
        {{string.Join("\n", feedbackCriterias
            .Where(c => c.Status == "unmet")
            .Select(c =>
            new
            {
                c.FeedbackCriteriaID,
                c.Description,
                c.Status
            }
        ))}}

        If the document complies with a feedback, its status is 'met'. Otherwise, its
        status remains 'unmet'

        You SHOULD NOT create new feedback criteria, only change the status of the criteria
        given and output them as shown below:

        Example:
        [{FeedbackCriteriaID: 1, Description: "Tabulate results", Status: "met"}, ... ]
        """;
        logger?.LogDebug("{prompt}", prompt);

        var userContent = new Content
        {
            Role = "user",
            Parts = new List<Part>
            {
                new Part{Text = prompt},
                new Part
                {
                    InlineData= new Blob
                    {
                        MimeType = "application/pdf",
                        Data = pdfDocument
                    }
                }
            }
        };

        var response = await client.Models.GenerateContentAsync(
            model: "gemini-2.5-flash",
            contents: new List<Content> { userContent },
            config: new GenerateContentConfig
            {
                ResponseMimeType = "application/json",
                ResponseJsonSchema = feedbackCriteriaListSchema
            }
        );

        var jsonText = response.Candidates[0].Content.Parts[0].Text;
        try
        {
            logger?.LogDebug(jsonText);
            return JsonSerializer.Deserialize<List<FeedbackDTO>>(jsonText);
        }
        catch (JsonException e)
        {
            return [];
        }
    }
}