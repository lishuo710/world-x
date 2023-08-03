using System.Net;
using server.Models;

namespace server.Network;

public class TcpGameServer : IGameServer
{
    public void RunServer(Action<IPEndPoint, ReceiveModel, IGameServer> received, Action<EndPoint> disconnected, Action<EndPoint> connected)
    {
        throw new NotImplementedException();
    }

    public void Send(byte[] dgram, int bytes, IPEndPoint endPoint)
    {
        throw new NotImplementedException();
    }

    public void Stop()
    {
        throw new NotImplementedException();
    }

    public void Restart()
    {
        
    }
}