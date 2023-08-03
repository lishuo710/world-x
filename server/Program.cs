using System.Collections.ObjectModel;
using System.Net;
using server.Models;
using server.Network;
using Timer = System.Timers.Timer;

public static class Program
{
    public static ObservableCollection<ClientModel> Clients { get; private set; } =
        new ObservableCollection<ClientModel>();

    private static Timer? _timers;

    private static void Main(string[] args)
    {
        PrintLine($"初始化连接,当前地址：{IPAddress.Any}:{200001}");
        SetUpTcpService();
    }

    private static void SetUpTcpService()
    {
        new TcpGameServer().RunServer(ReceivedData, OnClientDisconnected, OnClientConnected);
    }

    private static void ReceivedData(IPEndPoint remoteIpEndPoint, ReceiveModel msg, IGameServer service)
    {

    }

    private static void OnClientConnected(EndPoint point)
    {

    }

    private static void OnClientDisconnected(EndPoint point)
    {
        try
        {
            var client = Clients.FirstOrDefault(c => c.EndPoint.Equals(point));
            if (client == null) return;
            Clients.Remove(client);
        }
        catch (Exception ex)
        {
            PrintLine("在ClientDisconnected触发以后，删除client时报错了," + ex.Message + ", " + ex.StackTrace);
        }
    }

    private static void SetUpTimer()
    {
        _timers = new System.Timers.Timer(500);
        _timers.Elapsed += Timer_Elapsed;
        _timers.AutoReset = true;
        _timers.Start();
    }

    private static void Timer_Elapsed(object? sender, System.Timers.ElapsedEventArgs e)
    {
        NotifyClient();
    }

    private static void NotifyClient()
    {
        //TODO: send msg to client
    }

    private static void PrintLine(string message)
    {
        Console.WriteLine(message);
    }

}
