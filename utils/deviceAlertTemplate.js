const deviceAlertTemplate = ({
  name,
  email,
  role = "N/A",

  deviceType,
  vendor,
  model,

  browser,
  browserVersion,

  os,
  osVersion,

  ip,

  endpoint,
  method,

  issue,

  location = "Unknown",
  userAgent = "N/A",
}) => {

  const indiaTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  return `

  <div style="
    font-family: Arial, sans-serif;
    background:#f4f6f9;
    padding:30px;
  ">

    <div style="
      max-width:700px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      overflow:hidden;
      border:1px solid #ddd;
      box-shadow:0 2px 10px rgba(0,0,0,0.08);
    ">

     

      <div style="
        background:#d32f2f;
        color:white;
        padding:25px;
        text-align:center;
      ">

        <h1 style="
          margin:0;
          font-size:28px;
          letter-spacing:1px;
        ">
          RIGHTUP SECURITY ALERT
        </h1>

        <p style="
          margin-top:10px;
          font-size:14px;
        ">
          Unauthorized / Suspicious Mobile Access Detected
        </p>

      </div>

      

      <div style="padding:25px;">

        <p style="font-size:15px;">
          Hello Admin,
        </p>

        <p style="
          font-size:14px;
          color:#444;
          line-height:1.6;
        ">
          A suspicious activity or restricted mobile access attempt
          was detected in the RightUp Attendance Security System.
        </p>

        

        <div style="
          margin-top:15px;
          margin-bottom:20px;
        ">

          <span style="
            background:#ffebee;
            color:#c62828;
            padding:8px 14px;
            border-radius:20px;
            font-size:13px;
            font-weight:bold;
          ">
            SECURITY EVENT DETECTED
          </span>

        </div>

       

        <table
          border="1"
          cellpadding="10"
          cellspacing="0"
          width="100%"
          style="
            border-collapse:collapse;
            font-size:14px;
          "
        >

          <tr style="background:#f8f8f8;">
            <td width="35%"><b>User Name</b></td>
            <td>${name}</td>
          </tr>

          <tr>
            <td><b>Email</b></td>
            <td>${email}</td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>Role</b></td>
            <td>${role}</td>
          </tr>

          <tr>
            <td><b>Issue</b></td>
            <td style="color:#d32f2f;">
              <b>${issue}</b>
            </td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>API Endpoint</b></td>
            <td>${endpoint}</td>
          </tr>

          <tr>
            <td><b>HTTP Method</b></td>
            <td>${method}</td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>Device Type</b></td>
            <td>${deviceType}</td>
          </tr>

          <tr>
            <td><b>Mobile Vendor</b></td>
            <td>${vendor}</td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>Mobile Model</b></td>
            <td>${model}</td>
          </tr>

          <tr>
            <td><b>Browser</b></td>
            <td>${browser}</td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>Browser Version</b></td>
            <td>${browserVersion}</td>
          </tr>

          <tr>
            <td><b>Operating System</b></td>
            <td>${os}</td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>OS Version</b></td>
            <td>${osVersion}</td>
          </tr>

          <tr>
            <td><b>IP Address</b></td>
            <td>${ip}</td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>Location</b></td>
            <td>${location}</td>
          </tr>

          <tr>
            <td><b>User Agent</b></td>
            <td style="
              word-break:break-word;
              font-size:12px;
            ">
              ${userAgent}
            </td>
          </tr>

          <tr style="background:#f8f8f8;">
            <td><b>Time (IST)</b></td>
            <td>${indiaTime}</td>
          </tr>

        </table>

       

        <div style="
          margin-top:25px;
          padding:18px;
          background:#fff3cd;
          border:1px solid #ffeeba;
          border-radius:8px;
        ">

          <h3 style="
            margin-top:0;
            color:#856404;
          ">
            Recommended Actions
          </h3>

          <ul style="
            padding-left:18px;
            color:#856404;
            line-height:1.8;
          ">

            <li>Verify the user activity immediately</li>

            <li>Check whether the access was authorized</li>

            <li>Reset password if suspicious activity continues</li>

            <li>Review IP/device whitelist settings</li>

            <li>Audit attendance and login history</li>

          </ul>

        </div>

       

        <p style="
          margin-top:25px;
          font-size:13px;
          color:#666;
          line-height:1.6;
        ">

          This is an automated security notification generated by
          the RightUp Attendance Monitoring System.

        </p>

      </div>

     

      <div style="
        background:#f5f5f5;
        padding:20px;
        text-align:center;
        font-size:13px;
        color:#777;
      ">

        © ${new Date().getFullYear()} RightUp Business

        <br /><br />

        Website:

        <a
          href="https://www.rightupbussiness.store/"
          target="_blank"
          style="
            color:#1976d2;
            text-decoration:none;
            font-weight:bold;
          "
        >
          www.rightupbussiness.store
        </a>

      </div>

    </div>

  </div>

  `;
};

export default deviceAlertTemplate;

