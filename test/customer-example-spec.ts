import TypedMapper from "../src/index";
import * as chai from "chai";
import { datetime } from "common-types";
import { IMJConsumer } from "./data/customer-types";

const expect = chai.expect;

export interface ICustomer {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  address?: {
    id: number;
    postalCode: string;
    countryCode: string;
  };
}

describe("Customer example", () => {
  const customerMapper = new TypedMapper<IMJConsumer, ICustomer>();

  it("base types map correctly as part of an object conversion", async () => {
    const input: IMJConsumer = {
      id: 1235,
      first_name: "Bob",
      last_name: "Builder",
      isActiveUser: false
    };
    const mapper = customerMapper.map({
      id: input => String(input.id),
      firstName: input => input.first_name,
      lastName: input => input.last_name,
      isActive: input => input.isActiveUser
    });

    const result = customerMapper.convertObject(input);
    expect(result.firstName).to.equal(input.first_name);
    expect(result.lastName).to.equal(input.last_name);
    expect(result.isActive).to.equal(false);
  });

  it("base types map correctly as part of an object conversion", async () => {
    const input = [
      {
        id: 1235,
        first_name: "Bob",
        last_name: "Builder"
      },
      {
        id: 5589,
        first_name: "Jane",
        last_name: "Smith"
      }
    ];

    const result = customerMapper.convertArray(input);
    result.map((r, i) => {
      const record = input.find(i => String(i.id) === r.id);
      expect(r.firstName).to.equal(record.first_name);
      expect(r.lastName).to.equal(record.last_name);
    });
  });

  it("mapping object with a typed dictionary works", async () => {
    const input: IMJConsumer = {
      id: 1235,
      first_name: "Bob",
      last_name: "Builder",
      isActiveUser: false,
      addresses: [
        {
          id: 123,
          postal_code: "06268",
          country_code: "USA"
        }
      ]
    };
    const mapper = customerMapper.map({
      id: input => String(input.id),
      firstName: input => input.first_name,
      lastName: "last_name",
      isActive: input => input.isActiveUser,
      address: input =>
        input.addresses
          ? {
              id: input.addresses[0].id,
              postalCode: input.addresses[0].postal_code,
              countryCode: input.addresses[0].country_code
            }
          : undefined
    });

    const result = customerMapper.convertObject(input);
    expect(result.firstName).to.equal(input.first_name);
    expect(result.lastName).to.equal(input.last_name);
    expect(result.isActive).to.equal(false);
  });
});
