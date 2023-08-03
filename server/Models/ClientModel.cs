using System.Net;

namespace server.Models;

public class ClientModel
{
    public IPEndPoint EndPoint { get; set; }
    
    public DateTime LastActiveTime{ get; set; }
    
    public bool Expire => DateTime.Now.Subtract(LastActiveTime).TotalSeconds > 60;
}