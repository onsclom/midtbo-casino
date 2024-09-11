`/pull-slot`
- takes a marble
- 5% chance of hitting jackpot
  - gives 50% to the plurality investor
    - split evenly if there are multiple (left over marbles go to next slot)
  - gives 50% to the winner
- on losing pull

```
@<user> put in a marble!

The jackpot is now at <jackpot> marbles!

Slot leaderboard:
1. @<user> - <marbles> 👑 (bad beat leader)
1. @<user> - <marbles> 👑 (bad beat leader)
2. @<user> - <marbles>
2. x
3. y
4. z

`/pull-slot` to put in a marble for a 5% chance to win the jackpot!
50% of the jackpot goes to the winner
50% of the jackpot goes to the bad beat leader
```

- on winning pull:
```
@<user1> triggered the jackpot of <jackpot> marbles!

@<user1> wins <jackpot/2> marbles!
@<user2> wins <jackpot/2> marbles! (plurality investor)

{
  {if left over marbles}
    x left over marbles going into the next jackpot!
}

---

- later on think about the 33/33/33% infinity slot
