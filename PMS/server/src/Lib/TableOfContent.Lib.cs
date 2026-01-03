using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using static TableOfContentTree;
using static TableOfContentTree.Node;

/*
    Constraints:
        - A Section is always preceded by a Heading in the document.

        - A Heading can contain direct children sub-headings of different font-sizes,
                  even if such structure may not be valid. 

        Example:
            Heading (Font Size - 20)
                -> Sub-Heading 1 (FontSize - 14)
                -> Sub-Heading 2 (FontSize - 18)
                -> Sub-Heading 3 (FontSize - 16)

        - The EndPage of a previous Section is always the StartPage of a new Section's
                  Heading.

        - The document will be traversed sequentially, corresponding to a DFS traversal.

    A tree will be used to organize the sections in a hierarchical manner
*/
public class Section
{
    public string Name { get; set; }
    public int StartPage { get; set; }
    public int EndPage { get; set; }
}


public class TableOfContentTree
{
    public class Node
    {
        public double FontSize { get; set; }
        public Section? Section { get; set; }

        [System.Text.Json.Serialization.JsonIgnore]
        public Node? Parent { get; set; }
        public List<Node> SubNodes { get; set; }
    }

    public Node Root { get; set; }

    public TableOfContentTree(Node root)
    {
        Root = root;
    }

    public string ToString()
    {
        var stringBuilder = new StringBuilder();

        /*
            I wanted to express this as stringBuilder.AppendNode, but then I would have to create 
            a superclass of StringBuilder and move the AppendNode method to it, creating unecessary
            abstraction.
        */
        AppendNode(stringBuilder, Root, 0);

        return stringBuilder.ToString();
    }

    private void AppendNode(StringBuilder stringBuilder, Node node, int level)
    {
        string indent = new string(' ', level * 4);
        stringBuilder.AppendLine($"{indent}{node.Section.Name} (Page {node.Section.StartPage} - {node.Section.EndPage})");

        foreach (var subNode in node.SubNodes)
        {
            AppendNode(stringBuilder, subNode, level + 1);
        }
    }
}

public class TableOfContentTreeBuilder
{
    private int StartPage { get; set; }
    private int EndPage { get; set; }
    private TableOfContentTree TableOfContentTree { get; set; }
    private Node Prev { get; set; }

    public TableOfContentTreeBuilder(int StartPage, int EndPage)
    {
        this.StartPage = StartPage;
        this.EndPage = EndPage;

        var root = new Node
        {
            FontSize = 999,
            Section = new Section
            {
                Name = "Structure",
                StartPage = StartPage,
                EndPage = EndPage,
            },
            Parent = null,
            SubNodes = []
        };

        Prev = root;

        TableOfContentTree = new TableOfContentTree(root);
    }

    public void AddNode(double fontSize, string sectionName, int sectionStartPage)
    {
        var current = new Node
        {
            FontSize = fontSize,
            Section = new Section
            {
                Name = sectionName,
                StartPage = sectionStartPage,
                EndPage = EndPage
            },
            SubNodes = []
        };

        while (Prev != TableOfContentTree.Root && Prev.FontSize <= fontSize)
        {
            Prev.Section.EndPage = current.Section.StartPage;
            Prev = Prev.Parent;
        }

        Prev.Section.EndPage = current.Section.StartPage;
        Prev.SubNodes.Add(current);
        current.Parent = Prev;
        Prev = current;
    }

    public TableOfContentTree Build()
    {
        // Set the EndPage of all nodes up to and including the root node
        while (Prev != null)
        {
            Prev.Section.EndPage = EndPage;
            Prev = Prev.Parent;
        }

        return TableOfContentTree;
    }
}