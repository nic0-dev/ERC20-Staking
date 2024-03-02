const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require("hardhat");
const INITIAL_BALANCE = '100000000000000000000';

describe("NarwhalToken", () => {
    async function init() {
        const [owner, account2, account3] = await ethers.getSigners();
        const NarwhalToken = await ethers.getContractFactory("NarwhalToken");
        const cNarwhalToken = await NarwhalToken.deploy(INITIAL_BALANCE);

        return { cNarwhalToken, owner, account2, account3 };
    }
    // fixture
    it("should deploy", async () => {
        const {cNarwhalToken } = await loadFixture(init);
        expect(cNarwhalToken).not.to.be.undefined;
    });

    it("should be able to stake", async() => {
        const {cNarwhalToken, owner } = await loadFixture(init);
        expect(await cNarwhalToken.balanceOf(owner.address)).to.be.eq(INITIAL_BALANCE);

        const amount = ethers.parseEther('60');
        await cNarwhalToken.stake(amount);
        expect(await cNarwhalToken.balanceOf(owner.address)).to.be.eq(ethers.parseEther('40'));
        expect(await cNarwhalToken.balanceOf(cNarwhalToken.getAddress())).to.be.eq(ethers.parseEther('60'));
    });

    it("should be able to get current rewards", async() => {
        const {cNarwhalToken, owner } = await loadFixture(init);
        // console.log('>>>', await cNarwhalToken.balanceOf(owner.address));

        const amount = ethers.parseEther('60');
        await cNarwhalToken.connect(owner).stake(amount);
        const afterAnHour = (await time.latest() + (60 * 60));
        await time.increaseTo(afterAnHour);

        const reward = await cNarwhalToken.getCurrentReward(owner.address);
        expect(reward).to.be.greaterThan(0);
        // console.log('>>>reward', reward);
    });

    it("should be able to withdraw", async() => {
        const {cNarwhalToken, owner } = await loadFixture(init);

        const amountOriginalStake = ethers.parseEther('60');
        await cNarwhalToken.connect(owner).stake(amountOriginalStake);
        const balanceBeforeWithdraw = await cNarwhalToken.balanceOf(owner.address);
        await cNarwhalToken.connect(owner).withdraw();

        const rewards = await cNarwhalToken.getCurrentReward(owner.address);
        const balanceAfterStake = await cNarwhalToken.balanceOf(owner.address);
        
        expect(balanceAfterStake).to.be.eq(balanceBeforeWithdraw + amountOriginalStake + rewards);
    });
});