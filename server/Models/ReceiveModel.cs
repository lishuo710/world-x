namespace server.Models;

public class ReceiveModel
{        
    /// <summary>
    /// 命令类型,0ping命令，1消息, 2设置客户端信息, 3房间消息
    /// </summary>
    public byte CommandType { get; set; }

    /// <summary>
    /// 能处理的消息格式的版本号
    /// </summary>
    public int V { get; set; }
    /// <summary>
    /// 子命令类型
    /// </summary>
    public byte SubType { get; set; }
}