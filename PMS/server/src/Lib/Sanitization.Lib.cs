using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

public static class Sanitization
{
    private static readonly byte[] PdfHeader = { 0x25, 0x50, 0x44, 0x46 };
    private static readonly byte[] XlsHeader = { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 };
    private static readonly byte[] XlsxHeader = { 0x50, 0x4B, 0x03, 0x04 };

    /*
        All PDF files start with %PDF, which is represented by the magic number stored in the 
        PdfHeader variable.

        The validation verifies that the byte array is an actual PDF file by checking for the 
        appropriate header.
    */
    public static bool IsValidPdf(byte[] fileContent)
    {
        if (fileContent == null || fileContent.Length < PdfHeader.Length)
            return false;

        return fileContent.Take(PdfHeader.Length).SequenceEqual(PdfHeader);
    }

    public static bool IsValidExcel(byte[] fileContent)
    {
        if (fileContent == null || fileContent.Length < 4) return false;

        if (fileContent.Take(4).SequenceEqual(XlsxHeader))
            return true;

        if (fileContent.Length >= 8 && fileContent.Take(8).SequenceEqual(XlsHeader))
            return true;

        return false;
    }

    /*
        While EF Core prevents SQL injections, it does not necessarily stop XSS attacks
        on the client side when data is retrieved. React, by default, sanitizes the
        string but since strings such as filename is made available via the Content-Disposition
        header when the file is retrieved, sanitization is not performed and hence can
        lead to a security vulnerability.

        The method performs the following sanitization:
            1) Remove path characters
            2) Remove all special characters except for -, _ and .
            3) Limit the length to 255 characters
    */
    public static string SanitizeFilename(string filename)
    {
        if (string.IsNullOrWhiteSpace(filename))
            return "unnamed_file.pdf";

        string cleanName = Path.GetFileName(filename);
        cleanName = Regex.Replace(cleanName, @"[^a-zA-Z0-9\.\-_]", "_");
        if (cleanName.Length > 255)
            cleanName = cleanName.Substring(0, 255);

        return cleanName;
    }

    /*
        Sanitizes a general string to prevent XSS attacks by removing or escaping
        potentially harmful HTML/JavaScript characters and entities.

        React already sanitizes string insertion on the client side but on the server,
        HTML is enabled when composing mails. Lack of sanitization against XSS attacks
        can lead to security vulnerabilities.
    
        The method performs the following sanitization:
            1) Remove HTML/JavaScript event handlers and script tags
            2) Escape HTML special characters
            3) Limit the length to 1000 characters
    */
    public static string SanitizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        string cleanString = input.Trim();
        cleanString = Regex.Replace(cleanString, @"<[^>]*>", string.Empty, RegexOptions.IgnoreCase);
        cleanString = System.Net.WebUtility.HtmlEncode(cleanString);

        if (cleanString.Length > 1000)
            cleanString = cleanString[..1000];

        return cleanString;
    }
}