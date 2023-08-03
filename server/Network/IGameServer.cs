using System.Net;
using server.Models;

namespace server.Network;

public interface IGameServer
{
    public void RunServer(Action<IPEndPoint, ReceiveModel, IGameServer> received, Action<EndPoint> disconnected, Action<EndPoint> connected);

    public void Send(byte[] dgram, int bytes, IPEndPoint endPoint);

    public void Stop();

    public void Restart();
}