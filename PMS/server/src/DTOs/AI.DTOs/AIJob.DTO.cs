using Google.GenAI.Types;

namespace PMS.DTOs;

public class AIJob
{
    public long JobID { get; set; }
    public Content Content { get; set; }
    public GenerateContentConfig Config { get; set; }
    public string Response { get; set; }
}