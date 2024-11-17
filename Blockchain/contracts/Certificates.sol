// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Certificates {
    
  struct Certificate {
      uint id;
      string name;
      string course;
      string issue_date;
      bool valid;
  }

  mapping(uint => Certificate) public certificates;
  uint[] public certificate_ids;

  event Certificate_Registered(uint id, string name, string course, string issue_date);
  event Certificate_Revoked(uint id);

  function Register_Certificate(uint _id, string memory _name, string memory _course, string memory _issue_date) public {
      require(certificates[_id].id == 0, "ERROR!! Certificate ID already exists!");
      
      certificates[_id] = Certificate({
          id: _id,
          name: _name,
          course: _course,
          issue_date: _issue_date,
          valid: true
      });

      certificate_ids.push(_id);

      emit Certificate_Registered(_id, _name, _course, _issue_date);
  }
  
  function Revoke_Certificate(uint _id) public {
      Certificate storage cert = certificates[_id];
      require(cert.id != 0, "ERROR!! Certificate doesn't exist!");
      require(cert.valid, "ERROR!! Certificate already revoked!");

      cert.valid = false;
      emit Certificate_Revoked(_id);
  }

  function get_Certificate(uint _id) public view returns (uint, string memory, string memory, string memory, bool) {
    Certificate memory cert = certificates[_id];
    require(cert.id != 0, "ERROR!! Id not found, Certificate doesn't exist!");
    
    return (cert.id, cert.name, cert.course, cert.issue_date, cert.valid);
  }

  function getAll_CertificateIds() public view returns (uint[] memory) {
      return certificate_ids;
  }
}